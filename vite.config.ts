// vite.config.ts
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      modlib: path.resolve(__dirname, "code/modlib"),
    },
  },

  build: {
    // We don't actually need to build JS, but Vite requires a build config
    // We'll use the plugin to generate only the .ts file
    lib: {
      entry: path.resolve(__dirname, "mods/Testing/index.ts"),
      formats: ["es"],
      fileName: () => "dist",
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        entryFileNames: "dist.js",
      },
    },
    minify: false,
    emptyOutDir: true,
  },

  plugins: [
    // Custom plugin to merge all TS source into one .ts file and copy strings.json
    {
      name: "bundle-ts-source",
      closeBundle() {
        const processedFiles = new Set<string>();
        const files: string[] = [];

        // Walk directory and collect all .ts files
        const walk = (dir: string) => {
          console.log("dir", dir);
          for (const file of fs.readdirSync(dir)) {
            const filepath = path.join(dir, file);
            if (fs.statSync(filepath).isDirectory()) {
              walk(filepath);
            } else if (file.endsWith(".ts")) {
              const absPath = path.resolve(filepath);
              if (!processedFiles.has(absPath)) {
                processedFiles.add(absPath);
                const rel = path.relative(process.cwd(), filepath);
                let contents = fs.readFileSync(filepath, "utf8");
                // console.log("contents", contents);

                const updatedContentsPerLine: string[] = [];
                const contentsPerLine = contents.split("\n");

                for (let i = 0; i < contentsPerLine.length; i++) {
                  // Create import renames as new constants
                  const currentLine = contentsPerLine[i];
                  const importMatch = currentLine.match(
                    /^import\s+(?!type).*?;?\s*$/
                  );

                  if (importMatch && importMatch[0].endsWith("{\r")) {
                    const importLines = [];
                    importLines.push(currentLine.replace("\r", ""));

                    let nextLineIndex = i + 1;
                    let endFound = false;
                    while (contentsPerLine[nextLineIndex] && !endFound) {
                      if (contentsPerLine[nextLineIndex].endsWith(";\r")) {
                        endFound = true;
                      }
                      const nextLine = contentsPerLine[nextLineIndex];
                      importLines.push(nextLine.replace("\r", ""));
                      nextLineIndex++;
                    }
                    updatedContentsPerLine.push(importLines.join(""));
                    i = nextLineIndex - 1;
                  } else {
                    updatedContentsPerLine.push(currentLine);
                  }
                }

                // Replace renamed imports with a const rename "something as another" becomes "const another = something;"
                // This is a simplified approach and may need to be enhanced for complex cases
                for (let i = 0; i < updatedContentsPerLine.length; i++) {
                  const line = updatedContentsPerLine[i];
                  if (!line.startsWith("import ")) continue;
                  const importAsMatch = line.match(
                    /([a-zA-Z0-9]*) as ([a-zA-Z0-9]*)/gm
                  );
                  if (importAsMatch) {
                    let newLine = [];
                    for (const importAs of importAsMatch) {
                      const importAsParts = importAs.split(" as ");
                      const originalName = importAsParts[0];
                      const aliasName = importAsParts[1];
                      const replacementLine = `const ${aliasName} = ${originalName};\n`;
                      newLine.push(replacementLine);
                    }

                    // Replace the line in the updated contents
                    const index = updatedContentsPerLine.indexOf(line);
                    if (index !== -1) {
                      updatedContentsPerLine[index] = newLine.join("");
                    }
                  }
                }

                // Remove import statements since everything is inlined
                contents = updatedContentsPerLine
                  .join("\n")
                  .replace(/^import\s+.*?;?\s*$/gm, "");

                files.push(`// === ${rel} ===\n${contents}`);
              }
            }
          }
        };

        // First, collect files from modlib (dependencies)
        const modlibPath = path.resolve(__dirname, "code/modlib");
        if (fs.existsSync(modlibPath)) {
          walk(modlibPath);
        }

        // Then collect files from mods/Testing
        walk("mods/Testing");

        // Ensure dist directory exists
        const distDir = path.resolve(__dirname, "dist");
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true });
        }

        // Write merged TypeScript file
        // Note: The Portal SDK website has the 'mod' namespace types built-in,
        // so we don't include the triple-slash reference to avoid errors.
        // For local type-checking, types are configured in tsconfig.json
        const header = `// Portal SDK Bundled Script\n// The 'mod' namespace is provided by the Portal runtime environment\n\n`;
        const finalDistContent = header + files.join("\n\n");
        fs.writeFileSync(path.join(distDir, "dist.ts"), finalDistContent);
        console.log(
          "✅ dist/dist.ts generated with all TypeScript sources combined"
        );

        // Copy strings.json file
        const stringsSource = path.resolve(
          __dirname,
          "mods/Testing/strings.json"
        );
        const stringsDest = path.join(distDir, "strings.json");
        if (fs.existsSync(stringsSource)) {
          fs.copyFileSync(stringsSource, stringsDest);
          console.log("✅ strings.json copied to dist/");
        }

        // Remove unwanted .js and .d.ts files
        const jsFile = path.join(distDir, "dist.js");
        const dtsFile = path.join(distDir, "dist.d.ts");
        if (fs.existsSync(jsFile)) {
          fs.unlinkSync(jsFile);
        }
        if (fs.existsSync(dtsFile)) {
          fs.unlinkSync(dtsFile);
        }
        console.log("✅ Cleaned up .js and .d.ts files");

        // Create dist/tsconfig.json for type-checking dist.ts
        const tsconfigPath = path.join(distDir, "tsconfig.json");
        const tsconfigContent = {
          compilerOptions: {
            target: "ES2020",
            module: "ESNext",
            moduleResolution: "bundler",
            strict: true,
            outDir: "dist",
            declaration: true,
            declarationMap: true,
            esModuleInterop: true,
            skipLibCheck: true,
          },
          include: ["./dist.ts", "../global.d.ts"],
        };
        fs.writeFileSync(
          tsconfigPath,
          JSON.stringify(tsconfigContent, null, 2)
        );
        console.log("✅ dist/tsconfig.json created");

        const stringsJson = fs.readFileSync(stringsSource, "utf8");
        const strings = Object.keys(JSON.parse(stringsJson));

        function checkStringsAreRepresented() {
          // checks if all strings in the json are used in the codebase

          strings.forEach((strKey) => {
            if (!finalDistContent.includes(`mod.stringkeys.${strKey}`)) {
              console.warn(
                `⚠️ Warning: String key "${strKey}" from strings.json not found in codebase.`
              );
            }
          });
        }
        function checkStringNotInStringsJson() {
          // checks if any strings used in the code are missing from strings.json

          finalDistContent
            .match(/mod.stringkeys\.([a-zA-Z0-9_]+)/g)
            ?.forEach((match) => {
              const strKey = match.replace("mod.stringkeys.", "");
              if (!strings.includes(strKey)) {
                console.warn(
                  `⚠️ Warning: String key "${strKey}" used in code but not found in strings.json.`
                );
              }
            });
        }

        checkStringsAreRepresented();
        checkStringNotInStringsJson();
      },
    },
  ],
});
