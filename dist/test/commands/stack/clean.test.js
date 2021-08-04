"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const scenes_1 = require("../../scenes");
const utils_1 = require("../../utils");
function fakeGitSquashAndMerge(repo, branchName, squashedCommitMessage) {
    // Fake github squash and merge
    child_process_1.execSync(`git -C ${repo.dir} switch -q -c temp ${branchName}`);
    repo.checkoutBranch("temp");
    child_process_1.execSync(`git -C ${repo.dir} rebase main -Xtheirs`, { stdio: "ignore" });
    child_process_1.execSync(`git -C ${repo.dir} reset --soft $(git -C ${repo.dir} merge-base HEAD main)`);
    repo.checkoutBranch("main");
    child_process_1.execSync(`git -C ${repo.dir} commit -m "${squashedCommitMessage}"`);
    child_process_1.execSync(`git -C ${repo.dir} branch -D temp`);
}
function expectBranches(repo, sortedBranches) {
    chai_1.expect(child_process_1.execSync(`git -C ${repo.dir} for-each-ref refs/heads/ "--format=%(refname:short)"`)
        .toString()
        .trim()
        .split("\n")
        .filter((b) => b !== "prod")
        .sort()
        .join(", ")).to.equal(sortedBranches);
}
for (const scene of scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): stack clean`, function () {
        utils_1.configureTest(this, scene);
        it("Can delete a single merged branch", () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange("2", "a");
            scene.repo.execCliCommand(`branch create "a" -s`);
            expectBranches(scene.repo, "a, main");
            fakeGitSquashAndMerge(scene.repo, "a", "squash");
            scene.repo.execCliCommand(`stack clean -sf`);
            expectBranches(scene.repo, "main");
        }));
        it("Can delete the foundation of a double stack", () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange("2", "a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -s`);
            scene.repo.createChange("3", "b");
            scene.repo.execCliCommand(`branch create "b" -m "b" -s`);
            expectBranches(scene.repo, "a, b, main");
            fakeGitSquashAndMerge(scene.repo, "a", "squash");
            scene.repo.execCliCommand(`stack clean -sf`);
            expectBranches(scene.repo, "b, main");
            utils_1.expectCommits(scene.repo, "squash, 1");
            scene.repo.checkoutBranch("b");
            utils_1.expectCommits(scene.repo, "b, squash, 1");
        }));
        it("Can delete two branches off a three-stack", () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange("2", "a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -s`);
            scene.repo.createChange("3", "b");
            scene.repo.execCliCommand(`branch create "b" -m "b" -s`);
            scene.repo.createChange("4", "c");
            scene.repo.execCliCommand(`branch create "c" -m "c" -s`);
            expectBranches(scene.repo, "a, b, c, main");
            fakeGitSquashAndMerge(scene.repo, "a", "squash_a");
            fakeGitSquashAndMerge(scene.repo, "b", "squash_b");
            scene.repo.execCliCommand(`stack clean -sf`);
            expectBranches(scene.repo, "c, main");
            utils_1.expectCommits(scene.repo, "squash_b, squash_a, 1");
        }));
        it("Can delete two branches, while syncing inbetween, off a three-stack", () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange("2", "a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -s`);
            scene.repo.createChange("3", "b");
            scene.repo.execCliCommand(`branch create "b" -m "b" -s`);
            scene.repo.createChange("4", "c");
            scene.repo.execCliCommand(`branch create "c" -m "c" -s`);
            expectBranches(scene.repo, "a, b, c, main");
            fakeGitSquashAndMerge(scene.repo, "a", "squash_a");
            scene.repo.execCliCommand(`stack clean -sf`);
            fakeGitSquashAndMerge(scene.repo, "b", "squash_b");
            scene.repo.execCliCommand(`stack clean -sf`);
            expectBranches(scene.repo, "c, main");
            utils_1.expectCommits(scene.repo, "squash_b, squash_a, 1");
        }));
        xit("Can detect dead branches off multiple stacks", () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange("2", "a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -s`);
            scene.repo.createChange("3", "b");
            scene.repo.execCliCommand(`branch create "b" -m "b" -s`);
            scene.repo.createChange("4", "c");
            scene.repo.execCliCommand(`branch create "c" -m "c" -s`);
            expectBranches(scene.repo, "a, b, c, main");
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("5", "d");
            scene.repo.execCliCommand(`branch create "d" -m "d" -s`);
            scene.repo.createChange("6", "e");
            scene.repo.execCliCommand(`branch create "e" -m "e" -s`);
            fakeGitSquashAndMerge(scene.repo, "a", "squash_a");
            fakeGitSquashAndMerge(scene.repo, "b", "squash_b");
            fakeGitSquashAndMerge(scene.repo, "d", "squash_d");
            scene.repo.execCliCommand(`stack clean -sf`);
            expectBranches(scene.repo, "c, e, main");
            scene.repo.checkoutBranch("main");
            utils_1.expectCommits(scene.repo, "squash_b, squash_a, 1");
            scene.repo.checkoutBranch("c");
            utils_1.expectCommits(scene.repo, "c, squash_d, squash_b, squash_a, 1");
            scene.repo.checkoutBranch("e");
            utils_1.expectCommits(scene.repo, "e, squash_d, squash_b, squash_a, 1");
        }));
    });
}
//# sourceMappingURL=clean.test.js.map