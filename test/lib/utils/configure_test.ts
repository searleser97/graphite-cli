import { Branch } from "../../../src/wrapper-classes";
import { AbstractScene } from "../scenes/abstract_scene";

export function configureTest(suite: Mocha.Suite, scene: AbstractScene): void {
  suite.timeout(60000);
  suite.beforeEach(() => {
    scene.setup();
    Branch.resetMemoization();
  });
  suite.afterEach(() => {
    scene.cleanup();
  });
}
