import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default [
  // Base JS rules
  js.configs.recommended,

  // Node config files (tailwind, postcss, etc.)
  {
    files: ["**/*.config.js", "postcss.config.js", "tailwind.config.js"],
    languageOptions: {
      globals: globals.node,
      
    },
  },

  // React + JSX files
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
         Intl: "readonly",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
   rules: {
  // React
  "react/react-in-jsx-scope": "off",

  // Hooks
  "react-hooks/exhaustive-deps": "warn",

  // Noise reducers
  "no-unused-vars": "warn",
  "no-console": "off",

  // Accessibility – keep but warn
  "jsx-a11y/click-events-have-key-events": "warn",
  "jsx-a11y/no-static-element-interactions": "warn",

  // Allow legacy patterns
  "eqeqeq": "off",
}

  },
];
