import { expect } from "chai";
import Branch from "../../../src/wrapper-classes/branch";
import { allScenes } from "../../scenes";
import { configureTest } from "../../utils";

for (const scene of allScenes) {
  describe(`(${scene}): stack regen`, function () {
    configureTest(this, scene);

    it("Can regen a stack from scratch", () => {
      scene.repo.createChange("2", "2");
      scene.repo.execCliCommand(`branch create "a" -s`);

      scene.repo.createChangeAndCommit("3");
      scene.repo.createAndCheckoutBranch("b");
      scene.repo.createChangeAndCommit("4");

      const branch = new Branch("b");

      expect(branch.stackByTracingMetaParents().join(",")).not.to.equal(
        branch.stackByTracingGitParents().join(",")
      );

      scene.repo.checkoutBranch("a");

      scene.repo.execCliCommand("stack regen -s");

      scene.repo.checkoutBranch("b");

      expect(branch.stackByTracingMetaParents().join(",")).to.equal(
        branch.stackByTracingGitParents().join(",")
      );
    });

    it("Can gen a stack where the branch matches main HEAD", () => {
      scene.repo.createAndCheckoutBranch("a");
      scene.repo.execCliCommand("stack regen -s");
      expect(scene.repo.currentBranchName()).to.eq("a");
      scene.repo.execCliCommand(`branch prev`);
      expect(scene.repo.currentBranchName()).to.eq("main");
    });

    it("Can gen a stack branch head is behind main", () => {
      scene.repo.createAndCheckoutBranch("a");

      scene.repo.checkoutBranch("main");
      scene.repo.createChangeAndCommit("2");

      scene.repo.checkoutBranch("a");
      scene.repo.execCliCommand("stack regen -s");

      scene.repo.execCliCommand(`branch prev`);
      expect(scene.repo.currentBranchName()).to.eq("main");
    });
  });
}
