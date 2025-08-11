import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // Ignore les dossiers générés et non pertinents pour l'analyse
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "uploads/**",
      "public/**",
      "prisma/**",
      "dist/**",
      "build/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
