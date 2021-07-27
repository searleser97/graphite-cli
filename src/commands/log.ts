import { execSync } from "child_process";
import { profiledHandler } from "../lib/telemetry";

const args = {} as const;

export const command = "log";
export const description = "Log all stacks";
export const builder = args;

export const handler = async (): Promise<void> => {
  return profiledHandler(command, async () => {
    try {
      execSync(
        `git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(auto)%d%C(reset)' --all`,
        { stdio: "inherit" }
      );
    } catch (e) {
      // Ignore errors (this just means they quit git log)
    }
  });
};
