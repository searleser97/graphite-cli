import { expect } from "chai";
import { allScenes } from "../../scenes";

for (const scene of allScenes) {
  describe(`(${scene}): repo-config trunk`, function () {
    this.beforeEach(() => {
      scene.setup();
    });
    this.afterEach(() => {
      scene.cleanup();
    });
    this.timeout(5000);

    it("Can infer main trunk", () => {
      scene.repo.createChange("2", "a");
      scene.repo.execCliCommand("branch create 'a' -m '2' -s");
      expect(
        scene.repo
          .execCliCommandAndGetOutput("repo-config trunk")
          .includes("(main)")
      ).to.be.true;
    });
  });
}
