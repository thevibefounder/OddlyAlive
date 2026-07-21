import { cpSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = dirname(fileURLToPath(import.meta.url));
const sourceDir = resolve(projectDir, "../../assets/photoreal");
const targetDir = resolve(projectDir, "assets/images/photoreal");

mkdirSync(targetDir, { recursive: true });

for (const name of readdirSync(sourceDir)) {
  if (!name.endsWith(".png")) continue;
  cpSync(resolve(sourceDir, name), resolve(targetDir, name));
}

console.log(`Prepared photographic assets in ${targetDir}`);
