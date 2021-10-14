import { expect } from "chai";
import { BasicScene } from "../../../lib/scenes";
import { configureTest, expectCommits } from "../../../lib/utils";

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): gt continue tests`, function () {
    configureTest(this, scene);

    it("Can continue an upstack onto with no other children", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange("b");
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.checkoutBranch("main");

      scene.repo.createChange("c");
      scene.repo.execCliCommand("branch create 'c' -m 'c' -q");

      scene.repo.execCliCommand("upstack onto b");
      expect(scene.repo.rebaseInProgress()).to.eq(true);

      scene.repo.resolveMergeConflicts({
        mergeStrategy: "THEIRS",
      });
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand("continue -f");

      expect(scene.repo.rebaseInProgress()).to.eq(false);
      expectCommits(scene.repo, "c, b, a, 1");
    });

    it("Can continue an upstack onto with multiple children", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand("branch create 'a' -m 'a' -q");

      scene.repo.createChange("b");
      scene.repo.execCliCommand("branch create 'b' -m 'b' -q");

      scene.repo.checkoutBranch("main");

      scene.repo.createChange("c");
      scene.repo.execCliCommand("branch create 'c' -m 'c' -q");

      scene.repo.createChange("d");
      scene.repo.execCliCommand("branch create 'd' -m 'd' -q");

      scene.repo.createChange("e");
      scene.repo.execCliCommand("branch create 'e' -m 'e' -q");

      scene.repo.checkoutBranch("c");

      scene.repo.execCliCommand("upstack onto b");
      expect(scene.repo.rebaseInProgress()).to.eq(true);

      scene.repo.resolveMergeConflicts({ mergeStrategy: "THEIRS" });
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand("continue -f");

      expect(scene.repo.rebaseInProgress()).to.eq(false);
      scene.repo.checkoutBranch("e");
      expectCommits(scene.repo, "e, d, c, b, a, 1");
    });
  });
}
