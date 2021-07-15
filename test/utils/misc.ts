import { execSync } from "child_process";
export function execCliCommand(command: string, opts: { fromDir: string }) {
  execSync(
    `NODE_ENV=development node ${__dirname}/../../dist/src/index.js ${command}`,
    {
      stdio: "inherit",
      cwd: opts.fromDir,
    }
  );
}
