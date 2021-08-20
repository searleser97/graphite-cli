import { expect } from "chai";
import { allScenes } from "../../../lib/scenes";
import { configureTest } from "../../../lib/utils";

for (const scene of allScenes) {
  describe(`(${scene}): branch parent`, function () {
    configureTest(this, scene);

    it("Can list parent in a stack", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      expect(scene.repo.execCliCommandAndGetOutput(`branch parent`)).to.eq(
        "main"
      );
    });

    it("Fails to create a cycle", () => {
      scene.repo.createChange("a");
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);

      scene.repo.createChange("b");
      scene.repo.execCliCommand(`branch create "b" -m "b" -q`);

      scene.repo.checkoutBranch("a");
      expect(() => scene.repo.execCliCommand(`branch parent --set "b"`));
    });
  });
}
