import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.ts"],
    ignores: ["eslint.config.js"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
      },
      globals: {
        node: true,
        es6: true,
        console: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      "import": importPlugin,
    },
    rules: {
        "quotes": ["error", "double"],
        "import/no-unresolved": 0,
        "linebreak-style": "off",
        "object-curly-spacing": ["error", "never"],
        "no-trailing-spaces": "error",
        "comma-dangle": ["error", "always-multiline"],
        "eol-last": ["error", "always"],
    },
  },
 {
    files: ["eslint.config.js"],
    languageOptions: {
      globals: {
        node: true,
        es2022: true,
      },
    },
  },
  {
    ignores: [
      "lib/**/*",
      "generated/**/*",
    ],
  },
];