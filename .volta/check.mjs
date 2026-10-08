import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
function fail(message) {
  process.stderr.write("VOLTA Harness: " + message + "\n");
  process.exit(1);
}
let config;
try {
  config = JSON.parse(
    fs.readFileSync(path.join(__dirname, "harness.json"), "utf8"),
  );
} catch {
  fail("Missing or invalid harness.json");
}
if (
  config.schemaVersion !== 1 ||
  config.protocolVersion !== "1.0.0" ||
  !/^LucasFasolato\/[a-zA-Z0-9_-]+$/.test(config.repository)
)
  fail("Invalid protocol or repository identity");
if (!Array.isArray(config.entryDocs) || config.entryDocs.length < 1)
  fail("Entry documents are required");
for (const entry of config.entryDocs) {
  if (
    typeof entry !== "string" ||
    path.isAbsolute(entry) ||
    entry.split(/[\\/]/).includes("..") ||
    !fs.existsSync(path.join(root, entry))
  )
    fail("Unresolved entry document: " + entry);
}
const agents = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
if (!agents.includes(".volta/HARNESS.md"))
  fail("AGENTS.md must route to the local harness");
if (!fs.existsSync(path.join(__dirname, "HARNESS.md")))
  fail("Missing local harness routing document");
const declared = Object.values(config.verification || {});
if (
  declared.some(
    (group) =>
      !Array.isArray(group) ||
      group.some(
        (name) => typeof name !== "string" || !/^[-a-zA-Z0-9:_]+$/.test(name),
      ),
  )
)
  fail("Invalid verification command name");
const commands = declared.flat(),
  packagePath = path.join(root, "package.json");
let scripts = {};
if (fs.existsSync(packagePath))
  scripts = JSON.parse(fs.readFileSync(packagePath, "utf8")).scripts || {};
for (const command of commands)
  if (!scripts[command]) fail("Declared npm script does not exist: " + command);
if (
  !config.branches ||
  typeof config.branches.production !== "string" ||
  !config.branches.production
)
  fail("Production/release branch must be declared");
process.stdout.write(
  "VOLTA Harness contract OK: " +
    config.repository +
    " @ " +
    config.protocolVersion +
    "\nStructural/routing verification only; not product acceptance.\n",
);
if (process.argv.includes("--verify")) {
  const baseline = [
    ...new Set([
      ...(config.verification.static || []),
      ...(config.verification.tests || []),
      ...(config.verification.build || []),
    ]),
  ];
  if (!baseline.length)
    process.stdout.write(
      "Documentation-only adapter: no application checks declared.\n",
    );
  for (const script of baseline) {
    process.stdout.write(
      "Running existing local check: npm run " + script + "\n",
    );
    const result = spawnSync(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["run", script],
      { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
    );
    if (result.error || result.status !== 0)
      fail("Check failed or unavailable: " + script);
  }
}
