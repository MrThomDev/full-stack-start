import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["**/dist/", "**/coverage/"]),

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["*.config.ts"] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Keeps type-only imports erasable, so @app/shared never needs runtime JS.
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },

  {
    files: ["apps/server/**", "packages/tokens/**", "*.config.{js,ts}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["apps/web/**"],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },

  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  prettier,
);
