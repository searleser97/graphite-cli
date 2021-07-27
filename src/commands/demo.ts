import { execSync } from "child_process";
import tmp from "tmp";
import GitRepo from "../../test/utils/git_repo";
import { profiledHandler } from "../lib/telemetry";

export const command = "fix";
export const description = false;

const args = {} as const;
export const builder = args;

export const handler = async (): Promise<void> => {
  return profiledHandler(command, async () => {
    const tmpDir = tmp.dirSync();
    console.log(tmpDir.name);
    const repo = new GitRepo(tmpDir.name);

    repo.createChangeAndCommit("First commit");
    repo.createChangeAndCommit("Second commit");

    repo.createChange("[Product] Add review queue filter api");
    execCliCommand(
      "branch create 'tr--review_queue_api' -m '[Product] Add review queue filter api'",
      { fromDir: tmpDir.name }
    );

    repo.createChange("[Product] Add review queue filter server");
    execCliCommand(
      "branch create 'tr--review_queue_server' -m '[Product] Add review queue filter server'",
      { fromDir: tmpDir.name }
    );

    repo.createChange("[Product] Add review queue filter frontend");
    execCliCommand(
      "branch create 'tr--review_queue_frontend' -m '[Product] Add review queue filter frontend'",
      { fromDir: tmpDir.name }
    );

    repo.checkoutBranch("main");

    repo.createChange("[Bug Fix] Fix crashes on reload");
    execCliCommand(
      "branch create 'tr--fix_crash_on_reload' -m '[Bug Fix] Fix crashes on reload'",
      { fromDir: tmpDir.name }
    );

    repo.checkoutBranch("main");

    repo.createChange("[Bug Fix] Account for empty state");
    execCliCommand(
      "branch create 'tr--account_for_empty_state' -m '[Bug Fix] Account for empty state'",
      { fromDir: tmpDir.name }
    );

    repo.checkoutBranch("main");
  });
};

function execCliCommand(command: string, opts: { fromDir: string }) {
  execSync(`gp ${command}`, {
    stdio: "inherit",
    cwd: opts.fromDir,
  });
}
