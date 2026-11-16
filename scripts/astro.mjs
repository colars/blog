import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const packagePath = require.resolve("astro/package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const cliRelativePath =
  typeof packageJson.bin === "string" ? packageJson.bin : packageJson.bin.astro;
const cliPath = join(dirname(packagePath), cliRelativePath);

const result = spawnSync(process.execPath, [cliPath, ...process.argv.slice(2)], {
  env: {
    ...process.env,
    ASTRO_TELEMETRY_DISABLED: "1",
  },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
