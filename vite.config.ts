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

                // Remove import statements since everything is inlined
                contents = contents.replace(
                  /^import\s+.*?from\s+['"].*?['"];?\s*$/gm,
                  ""
                );

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
        fs.writeFileSync(
          path.join(distDir, "dist.ts"),
          header + files.join("\n\n")
        );
        console.log(
          "✅ dist/dist.ts generated with all TypeScript sources combined"
        );

        // Copy strings.json file
        const stringsSource = path.resolve(
          __dirname,
          "mods/Testing/Testing.strings.json"
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
      },
    },
  ],
});
