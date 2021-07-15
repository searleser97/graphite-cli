import { execSync } from "child_process";
export function execCliCommand(command: string, opts: { fromDir: string }) {
  execSync(`node ${__dirname}/../../dist/src/index.js ${command}`, {
    stdio: "inherit",
    cwd: opts.fromDir,
  });
}
