import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import {
  execCliCommand,
  execCliCommandAndGetOutput,
} from "../../utils/exec_cli_command";
import GitRepo from "../../utils/git_repo";

describe("repo-config trunk", function () {
  let tmpDir: tmp.DirResult;
  let repo: GitRepo;
  this.beforeEach(() => {
    tmpDir = tmp.dirSync();
    repo = new GitRepo(tmpDir.name);
    repo.createChangeAndCommit("1", "first");
  });
  afterEach(() => {
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });
  this.timeout(5000);

  it("Can infer main trunk", () => {
    repo.createChange("2", "a");
    execCliCommand("branch create 'a' -m '2' -s", { fromDir: tmpDir.name });
    expect(
      execCliCommandAndGetOutput("repo-config trunk", {
        fromDir: tmpDir.name,
      }).includes("(main)")
    ).to.be.true;
  });
});
