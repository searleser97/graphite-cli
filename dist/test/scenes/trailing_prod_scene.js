"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrailingProdScene = void 0;
const child_process_1 = require("child_process");
const abstract_scene_1 = require("./abstract_scene");
class TrailingProdScene extends abstract_scene_1.AbstractScene {
    toString() {
        return "TrailingProdScene";
    }
    setup() {
        super.setup();
        this.repo.createChangeAndCommit("0");
        this.repo.createAndCheckoutBranch("prod");
        this.repo.createChangeAndCommit("prod", "prod");
        this.repo.checkoutBranch("main");
        this.repo.createChangeAndCommit("0.5", "0.5");
        child_process_1.execSync(`git -C "${this.dir}" merge prod`);
        this.repo.checkoutBranch("main");
        this.repo.createChangeAndCommit("1", "1");
    }
}
exports.TrailingProdScene = TrailingProdScene;
//# sourceMappingURL=trailing_prod_scene.js.map