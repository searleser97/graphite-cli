import { expect } from "chai";
import fs from "fs-extra";
import tmp from "tmp";
import { validate } from "../../src/actions/validate";
import { execCliCommand } from "../utils/exec_cli_command";
import GitRepo from "../utils/git_repo";

describe("validate action", function () {
  let tmpDir: tmp.DirResult;
  let repo: GitRepo;
  const oldDir = __dirname;
  this.beforeEach(() => {
    tmpDir = tmp.dirSync();
    process.chdir(tmpDir.name);
    repo = new GitRepo(tmpDir.name);
    repo.createChangeAndCommit("1");
  });
  this.afterEach(() => {
    process.chdir(oldDir);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });
  this.timeout(5000);

  it("Can validate upstack", () => {
    repo.createChange("a");
    execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });

    repo.createAndCheckoutBranch("b");
    repo.createChangeAndCommit("1");

    repo.createChange("c");
    execCliCommand(`branch create "c" -s`, { fromDir: tmpDir.name });

    repo.createChange("d");
    execCliCommand(`branch create "d" -s`, { fromDir: tmpDir.name });

    repo.checkoutBranch("a");
    expect(validate("UPSTACK", true)).to.throw(Error);

    repo.checkoutBranch("b");
    expect(validate("UPSTACK", true)).to.throw(Error);

    repo.checkoutBranch("c");
    expect(validate("UPSTACK", true)).to.not.throw;

    repo.checkoutBranch("d");
    expect(validate("UPSTACK", true)).to.not.throw;
  });

  it("Can validate downstack", () => {
    repo.createChange("a");
    execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });

    repo.createAndCheckoutBranch("b");
    repo.createChangeAndCommit("1");

    repo.createChange("c");
    execCliCommand(`branch create "c" -s`, { fromDir: tmpDir.name });

    repo.createChange("d");
    execCliCommand(`branch create "d" -s`, { fromDir: tmpDir.name });

    repo.checkoutBranch("a");
    expect(validate("DOWNSTACK", true)).to.not.throw;

    repo.checkoutBranch("b");
    expect(validate("DOWNSTACK", true)).to.throw(Error);

    repo.checkoutBranch("c");
    expect(validate("DOWNSTACK", true)).to.throw(Error);

    repo.checkoutBranch("d");
    expect(validate("DOWNSTACK", true)).to.throw(Error);
  });

  it("Can validate fullstack", () => {
    repo.createChange("a");
    execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
    expect(validate("FULLSTACK", true)).to.not.throw;

    repo.createChange("b");
    execCliCommand(`branch create "b" -s`, { fromDir: tmpDir.name });
    expect(validate("FULLSTACK", true)).to.not.throw;

    repo.createAndCheckoutBranch("c");
    repo.createChangeAndCommit("c");
    expect(validate("FULLSTACK", true)).to.throw(Error);
  });
});
