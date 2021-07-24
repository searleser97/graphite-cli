"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("../../src/lib/utils");
const TEXT_FILE_NAME = "test.txt";
class GitRepo {
    constructor(dir) {
        this.dir = dir;
        child_process_1.execSync(`git init ${dir} -b main`);
    }
    createChange(textValue, prefix) {
        const filePath = `${this.dir}/${prefix ? prefix + "_" : ""}${TEXT_FILE_NAME}`;
        fs_extra_1.default.writeFileSync(filePath, textValue);
        child_process_1.execSync(`git -C ${this.dir} add ${filePath}`);
    }
    createChangeAndCommit(textValue, prefix) {
        this.createChange(textValue, prefix);
        child_process_1.execSync(`git -C ${this.dir} add .`);
        child_process_1.execSync(`git -C ${this.dir} commit -m "${textValue}"`);
    }
    createAndCheckoutBranch(name) {
        child_process_1.execSync(`git -C ${this.dir} checkout -b "${name}"`, { stdio: "ignore" });
    }
    checkoutBranch(name) {
        child_process_1.execSync(`git -C ${this.dir} checkout "${name}"`, { stdio: "ignore" });
    }
    rebaseInProgress() {
        return utils_1.rebaseInProgress({ dir: this.dir });
    }
    finishInteractiveRebase() {
        while (this.rebaseInProgress()) {
            child_process_1.execSync(`git -C ${this.dir} add .`, { stdio: "ignore" });
            child_process_1.execSync(`GIT_EDITOR="touch $1" git -C ${this.dir} rebase --continue`, {
                stdio: "ignore",
            });
        }
    }
    currentBranchName() {
        return child_process_1.execSync(`git -C ${this.dir} branch --show-current`)
            .toString()
            .trim();
    }
    listCurrentBranchCommitMessages() {
        return child_process_1.execSync(`git -C ${this.dir} log --oneline  --format=%B`)
            .toString()
            .trim()
            .split("\n")
            .filter((line) => line.length > 0);
    }
}
exports.default = GitRepo;
//# sourceMappingURL=git_repo.js.map