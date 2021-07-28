import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import fs from "fs-extra";
import tmp from "tmp";
import { validate } from "../../src/actions/validate";
import { execCliCommand } from "../utils/exec_cli_command";
import GitRepo from "../utils/git_repo";

chai.use(chaiAsPromised);

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

  it("Can validate upstack", async () => {
    repo.createChange("a");
    execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });

    repo.createAndCheckoutBranch("b");
    repo.createChangeAndCommit("1");

    repo.createChange("c");
    execCliCommand(`branch create "c" -s`, { fromDir: tmpDir.name });

    repo.createChange("d");
    execCliCommand(`branch create "d" -s`, { fromDir: tmpDir.name });

    repo.checkoutBranch("a");
    await expect(validate("UPSTACK", true)).to.eventually.be.rejectedWith(
      Error
    );

    repo.checkoutBranch("b");
    await expect(validate("UPSTACK", true)).to.not.eventually.be.rejectedWith(
      Error
    );

    repo.checkoutBranch("c");
    await expect(validate("UPSTACK", true)).to.not.eventually.be.rejectedWith(
      Error
    );

    repo.checkoutBranch("d");
    await expect(validate("UPSTACK", true)).to.not.eventually.be.rejectedWith(
      Error
    );
  });

  it("Can validate downstack", async () => {
    repo.createChange("a");
    execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });

    repo.createAndCheckoutBranch("b");
    repo.createChangeAndCommit("1");

    repo.createChange("c");
    execCliCommand(`branch create "c" -s`, { fromDir: tmpDir.name });

    repo.createChange("d");
    execCliCommand(`branch create "d" -s`, { fromDir: tmpDir.name });

    repo.checkoutBranch("a");
    await expect(validate("DOWNSTACK", true)).to.not.eventually.be.rejectedWith(
      Error
    );

    repo.checkoutBranch("b");
    await expect(validate("DOWNSTACK", true)).to.eventually.be.rejectedWith(
      Error
    );

    repo.checkoutBranch("c");
    await expect(validate("DOWNSTACK", true)).to.eventually.be.rejectedWith(
      Error
    );

    repo.checkoutBranch("d");
    await expect(validate("DOWNSTACK", true)).to.eventually.be.rejectedWith(
      Error
    );
  });

  it("Can validate fullstack", async () => {
    repo.createChange("a");
    execCliCommand(`branch create "a" -s`, { fromDir: tmpDir.name });
    await expect(validate("FULLSTACK", true)).to.not.eventually.be.rejectedWith(
      Error
    );

    repo.createChange("b");
    execCliCommand(`branch create "b" -s`, { fromDir: tmpDir.name });
    await expect(validate("FULLSTACK", true)).to.not.eventually.be.rejectedWith(
      Error
    );

    repo.createAndCheckoutBranch("c");
    repo.createChangeAndCommit("c");
    await expect(validate("FULLSTACK", true)).to.eventually.be.rejectedWith(
      Error
    );
  });
});
