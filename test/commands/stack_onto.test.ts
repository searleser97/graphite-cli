import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import { execCliCommand } from "../utils/exec_cli_command";
import GitRepo from "../utils/git_repo";

describe("stack onto", function () {
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

  it("Can fix a leaf stack onto main", () => {
    repo.createChange("2", "a");
    execCliCommand("diff -b 'a' -m '2' -s", { fromDir: tmpDir.name });

    repo.createChange("3", "b");
    execCliCommand("diff -b 'b' -m '3' -s", { fromDir: tmpDir.name });

    execCliCommand("stack onto main -s", { fromDir: tmpDir.name });
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal("3, 1");
    expect(() => execCliCommand("validate -s", { fromDir: tmpDir.name })).not.to
      .throw;
  });
});