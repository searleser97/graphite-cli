import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import GitRepo from "../utils/git_repo";
import { execCliCommand } from "../utils/misc";

describe("Restack", function () {
  let tmpDir: tmp.DirResult;
  let repo: GitRepo;
  this.beforeEach(() => {
    tmpDir = tmp.dirSync();
    repo = new GitRepo(tmpDir.name);
    repo.createChangeAndCommit("1");
  });
  afterEach(() => {
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });
  this.timeout(5000);

  it("Can restack a branch", () => {
    // Setup
    repo.createChange("2.5");
    execCliCommand("diff -b 'a' -m '2.5' -s", { fromDir: tmpDir.name });
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      ["2.5", "1"].join(", ")
    );
    repo.checkoutBranch("main");
    repo.createChangeAndCommit("2");

    // Double check the state of main
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      ["2", "1"].join(", ")
    );

    // Perform the restack
    execCliCommand("restack -s", { fromDir: tmpDir.name });
    // Expect restacking not to change the current checked out branch.
    expect(repo.currentBranchName()).to.equal("main");
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      ["2", "1"].join(", ")
    );

    // Verify the restacked branch
    repo.checkoutBranch("a");
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      ["2.5", "2", "1"].join(", ")
    );
  });

  it("Can restack a stack of two branches", () => {
    repo.createChange("2.5");
    execCliCommand("diff -b 'a' -m '2.5' -s", { fromDir: tmpDir.name });

    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      ["2.5", "1"].join(", ")
    );

    repo.createChange("3.5");
    execCliCommand("diff -b 'b' -m '3.5' -s", { fromDir: tmpDir.name });

    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      ["3.5", "2.5", "1"].join(", ")
    );

    repo.checkoutBranch("main");
    repo.createChangeAndCommit("2");

    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      ["2", "1"].join(", ")
    );

    expect(repo.currentBranchName()).to.equal("main");
    execCliCommand("restack -s", { fromDir: tmpDir.name });
    // Expect restacking not to change the current checked out branch.
    expect(repo.currentBranchName()).to.equal("main");

    repo.checkoutBranch("b");
    expect(repo.listCurrentBranchCommitMessages().join(", ")).to.equal(
      ["3.5", "2.5", "2", "1"].join(", ")
    );
  });

  it("Cannot restack branches that fail validation", () => {
    repo.createAndCheckoutBranch("a");
    repo.createChangeAndCommit("2");
    repo.createAndCheckoutBranch("b");
    repo.createChangeAndCommit("3");
    expect(() => {
      execCliCommand("restack -s", { fromDir: tmpDir.name });
    }).to.throw();
  });
});
