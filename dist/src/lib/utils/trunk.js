"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrunk = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
function findRemoteOriginBranch() {
    let config;
    try {
        const gitDir = child_process_1.execSync(`git rev-parse --git-dir`).toString().trim();
        config = fs_extra_1.default.readFileSync(path_1.default.join(gitDir, "config")).toString();
    }
    catch (_a) {
        throw new Error(`Failed to read .git config when determining trunk branch`);
    }
    const originBranchSections = config
        .split("[")
        .filter((section) => section.includes('branch "') && section.includes("remote = origin"));
    if (originBranchSections.length !== 1) {
        return undefined;
    }
    try {
        const matches = originBranchSections[0].match(/branch "(.+)"\]/);
        if (matches && matches.length == 1) {
            return new branch_1.default(matches[0]);
        }
    }
    catch (_b) {
        return undefined;
    }
    return undefined;
}
function findCommonlyNamedTrunk() {
    const potentialTrunks = branch_1.default.allBranches().filter((b) => ["main", "master"].includes(b.name));
    if (potentialTrunks.length === 1) {
        return potentialTrunks[0];
    }
    else {
        throw new Error(`Detected both a "main" and "master" branch, cannot infer repo trunk.`);
    }
}
let memoizedTrunk;
function getTrunk() {
    if (memoizedTrunk) {
        return memoizedTrunk;
    }
    const remoteOriginBranch = findRemoteOriginBranch();
    if (remoteOriginBranch) {
        memoizedTrunk = remoteOriginBranch;
        return memoizedTrunk;
    }
    memoizedTrunk = findCommonlyNamedTrunk();
    return memoizedTrunk;
}
exports.getTrunk = getTrunk;
//# sourceMappingURL=trunk.js.map