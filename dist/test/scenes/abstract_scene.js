"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractScene = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_1 = __importDefault(require("tmp"));
const git_repo_1 = __importDefault(require("../utils/git_repo"));
class AbstractScene {
    constructor() {
        this.oldDir = child_process_1.execSync("pwd").toString().trim();
        this.tmpDir = tmp_1.default.dirSync();
        this.dir = this.tmpDir.name;
        this.repo = new git_repo_1.default(this.dir);
    }
    setup() {
        this.tmpDir = tmp_1.default.dirSync();
        this.dir = this.tmpDir.name;
        this.repo = new git_repo_1.default(this.dir);
        process.chdir(this.dir);
        if (process.env.DEBUG) {
            console.log(`Dir: ${this.dir}`);
        }
    }
    cleanup() {
        process.chdir(this.oldDir);
        if (!process.env.DEBUG) {
            fs_extra_1.default.emptyDirSync(this.dir);
            this.tmpDir.removeCallback();
        }
    }
}
exports.AbstractScene = AbstractScene;
//# sourceMappingURL=abstract_scene.js.map