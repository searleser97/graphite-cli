import { expect } from "chai";
import { BasicScene } from "../../../lib/scenes";
import { configureTest, expectCommits } from "../../../lib/utils";

for (const scene of [new BasicScene()]) {
  // eslint-disable-next-line max-lines-per-function
  describe(`(${scene}): continue upstack onto`, function () {
    configureTest(this, scene);

    it("Can continue a stack fix with single merge conflict", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.checkoutBranch("main");

      scene.repo.createChange("b");
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.execCliCommand("upstack onto a");

      expect(scene.repo.rebaseInProgress()).to.be.true;
      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand("continue -f");

      // Continue should finish the work that stack fix started, not only
      // completing the rebase but also re-checking out the original
      // branch.
      expect(scene.repo.currentBranchName()).to.equal("b");
      expectCommits(scene.repo, "b, a");
      expect(scene.repo.rebaseInProgress()).to.be.false;
    });

    it("Can run continue multiple times on a stack fix with multiple merge conflicts", () => {
      scene.repo.createChange("a", "1");
      scene.repo.createChange("a", "2");
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.checkoutBranch("main");

      scene.repo.createChange("b", "1");
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.createChange("c", "2");
      scene.repo.execCliCommand("branch create 'c' -m 'c' -q");

      scene.repo.checkoutBranch("b");
      scene.repo.execCliCommand("upstack onto a");

      expect(scene.repo.rebaseInProgress()).to.be.true;
      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand("continue -f");

      expect(scene.repo.rebaseInProgress()).to.be.true;
      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand("continue -f");

      // Continue should finish the work that stack fix started, not only
      // completing the rebase but also re-checking out the original
      // branch.
      expect(scene.repo.currentBranchName()).to.equal("b");
      expectCommits(scene.repo, "b, a");
      expect(scene.repo.rebaseInProgress()).to.be.false;

      // Ensure that the upstack worked too (verify integrity of entire stack).
      scene.repo.checkoutBranch("c");
      expectCommits(scene.repo, "c, b, a");
    });
  });
}
