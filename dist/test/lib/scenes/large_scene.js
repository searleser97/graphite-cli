"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LargeScene = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const utils_1 = require("../../../src/lib/utils");
const abstract_scene_1 = require("./abstract_scene");
class LargeScene extends abstract_scene_1.AbstractScene {
    toString() {
        return "LargeScene";
    }
    setup() {
        this.tmpDir = tmp_1.default.dirSync();
        this.dir = this.tmpDir.name;
        this.repo = new utils_1.GitRepo(this.dir, false);
        child_process_1.execSync(`git clone https://github.com/dagster-io/dagster.git ${this.dir}`);
        child_process_1.execSync(`git branch -r | grep -v '\\->' | while read remote; do git branch --track "\${remote#origin/}" "$remote"; done`, { cwd: this.dir });
        child_process_1.execSync(`git -C ${this.dir} fetch --all`);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/.graphite_repo_config`, JSON.stringify({ trunk: "master" }, null, 2));
        process.chdir(this.dir);
        if (process.env.DEBUG) {
            console.log(`Dir: ${this.dir}`);
        }
        this.repo.createChangeAndCommit("1", "1");
    }
}
exports.LargeScene = LargeScene;
//# sourceMappingURL=large_scene.js.map