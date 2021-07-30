import { expect } from "chai";
import { allScenes } from "../../scenes";

for (const scene of allScenes) {
  describe(`(${scene}): branch create`, function () {
    this.beforeEach(() => {
      scene.setup();
    });
    this.afterEach(() => {
      scene.cleanup();
    });
    this.timeout(5000);

    it("Can run branch create", () => {
      scene.repo.createChange("2");

      scene.repo.execCliCommand(`branch create "a" -s`);
      expect(scene.repo.currentBranchName()).to.equal("a");

      scene.repo.execCliCommand("branch prev");
      expect(scene.repo.currentBranchName()).to.equal("main");
    });

    it("Can rollback changes on a failed commit hook", () => {
      // Agressive AF commit hook from your angry coworker
      scene.repo.createPrecommitHook("exit 1");
      scene.repo.createChange("2");
      expect(() => {
        scene.repo.execCliCommand(`branch create "a" -s`);
      }).to.throw(Error);
      expect(scene.repo.currentBranchName()).to.equal("main");
    });

    it("Can create a branch without providing a name", () => {
      scene.repo.createChange("2");
      scene.repo.execCliCommand(`branch create -s`);
      expect(scene.repo.currentBranchName()).to.not.equal("main");
    });
  });
}
