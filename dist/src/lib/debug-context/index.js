"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recreateState = exports.captureState = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const tmp_1 = __importDefault(require("tmp"));
const metadata_ref_1 = __importDefault(require("../../wrapper-classes/metadata_ref"));
const config_1 = require("../config");
const branch_ref_1 = require("../git-refs/branch_ref");
const branch_relations_1 = require("../git-refs/branch_relations");
const preconditions_1 = require("../preconditions");
const utils_1 = require("../utils");
function captureState() {
    const refTree = branch_relations_1.getRevListGitTree({
        useMemoizedResults: false,
        direction: "parents",
    });
    const branchToRefMapping = branch_ref_1.getBranchToRefMapping();
    const metadata = {};
    metadata_ref_1.default.allMetadataRefs().forEach((ref) => {
        metadata[ref._branchName] = JSON.stringify(ref.read());
    });
    const state = {
        refTree,
        branchToRefMapping,
        userConfig: JSON.stringify(config_1.userConfig._data),
        repoConfig: JSON.stringify(config_1.repoConfig._data),
        metadata,
    };
    return JSON.stringify(state, null, 2);
}
exports.captureState = captureState;
function recreateState(stateJson) {
    const state = JSON.parse(stateJson);
    const refMappingsOldToNew = {};
    const tmpDir = createTmpGitDir();
    process.chdir(tmpDir);
    utils_1.logInfo(`Creating ${Object.keys(state.refTree).length} commits`);
    recreateCommits({ refTree: state.refTree, refMappingsOldToNew });
    utils_1.logInfo(`Creating ${Object.keys(state.branchToRefMapping).length} branches`);
    createBranches({
        branchToRefMapping: state.branchToRefMapping,
        refMappingsOldToNew,
    });
    utils_1.logInfo(`Creating the repo config`);
    fs_extra_1.default.writeFileSync(path_1.default.join(tmpDir, "/.git/.graphite_repo_config"), state.repoConfig);
    utils_1.logInfo(`Creating the metadata`);
    createMetadata({ metadata: state.metadata, tmpDir });
    return tmpDir;
}
exports.recreateState = recreateState;
function createMetadata(opts) {
    fs_extra_1.default.mkdirSync(`${opts.tmpDir}/.git/refs/branch-metadata`);
    Object.keys(opts.metadata).forEach((branchName) => {
        const metaSha = utils_1.gpExecSync({
            command: `git hash-object -w --stdin`,
            options: {
                input: opts.metadata[branchName],
            },
        }).toString();
        fs_extra_1.default.writeFileSync(`${opts.tmpDir}/.git/refs/branch-metadata/${branchName}`, metaSha);
    });
}
function createBranches(opts) {
    const curBranch = preconditions_1.currentBranchPrecondition();
    Object.keys(opts.branchToRefMapping).forEach((branch) => {
        const originalRef = opts.refMappingsOldToNew[opts.branchToRefMapping[branch]];
        if (branch != curBranch.name)
            utils_1.gpExecSync({ command: `git branch -f ${branch} ${originalRef}` });
    });
}
function recreateCommits(opts) {
    const treeObjectId = getTreeObjectId();
    const commitsToCreate = commitRefsWithNoParents(opts.refTree);
    const firstCommitRef = utils_1.gpExecSync({ command: `git rev-parse HEAD` });
    while (commitsToCreate.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalCommitRef = commitsToCreate.shift();
        const originalParents = opts.refTree[originalCommitRef] || [];
        const newCommitRef = utils_1.gpExecSync({
            command: `git commit-tree ${treeObjectId} -m "${originalCommitRef}" ${originalParents.length === 0
                ? `-p ${firstCommitRef}`
                : originalParents
                    .map((p) => opts.refMappingsOldToNew[p])
                    .map((newParentRef) => `-p ${newParentRef}`)
                    .join(" ")}`,
        })
            .toString()
            .trim();
        // Save mapping so we can later associate branches.
        opts.refMappingsOldToNew[originalCommitRef] = newCommitRef;
        // Find all commits with this as parent, and enque them for creation.
        Object.keys(opts.refTree).forEach((potentialChildRef) => {
            const parents = opts.refTree[potentialChildRef];
            if (parents.includes(originalCommitRef)) {
                commitsToCreate.push(potentialChildRef);
            }
        });
    }
}
function createTmpGitDir() {
    const tmpDir = tmp_1.default.dirSync().name;
    utils_1.logInfo(`Creating tmp repo`);
    utils_1.gpExecSync({ command: `git -C ${tmpDir} init -b "main"` });
    utils_1.gpExecSync({
        command: `cd ${tmpDir} && echo "first" > first.txt && git add first.txt && git commit -m "first"`,
    });
    return tmpDir;
}
function commitRefsWithNoParents(refTree) {
    // Create commits for each ref
    const allRefs = [
        ...new Set(Object.keys(refTree).concat.apply([], Object.values(refTree))),
    ];
    return allRefs.filter((ref) => refTree[ref] === undefined || refTree[ref].length === 0);
}
function getTreeObjectId() {
    return utils_1.gpExecSync({
        command: `git cat-file -p HEAD | grep tree | awk '{print $2}'`,
    })
        .toString()
        .trim();
}
//# sourceMappingURL=index.js.map