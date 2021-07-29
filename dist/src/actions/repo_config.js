"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trunkBranches = exports.setRepoName = exports.getRepoName = exports.setRepoOwner = exports.getRepoOwner = exports.CURRENT_REPO_CONFIG_PATH = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../lib/utils");
const CONFIG_NAME = ".graphite_repo_config";
exports.CURRENT_REPO_CONFIG_PATH = (() => {
    const repoRootPath = utils_1.gpExecSync({
        command: `git rev-parse --show-toplevel`,
    }, (e) => {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    if (!repoRootPath || repoRootPath.length === 0) {
        utils_1.logErrorAndExit("No .git repository found.");
    }
    return path_1.default.join(repoRootPath, CONFIG_NAME);
})();
let repoConfig = {};
if (fs_extra_1.default.existsSync(exports.CURRENT_REPO_CONFIG_PATH)) {
    const repoConfigRaw = fs_extra_1.default.readFileSync(exports.CURRENT_REPO_CONFIG_PATH);
    try {
        repoConfig = JSON.parse(repoConfigRaw.toString().trim());
    }
    catch (e) {
        console.log(chalk_1.default.yellow(`Warning: Malformed ${exports.CURRENT_REPO_CONFIG_PATH}`));
    }
}
function getRepoOwner() {
    if (repoConfig.owner) {
        return repoConfig.owner;
    }
    const inferredInfo = inferRepoGitHubInfo();
    if (inferredInfo === null || inferredInfo === void 0 ? void 0 : inferredInfo.repoOwner) {
        return inferredInfo.repoOwner;
    }
    utils_1.logErrorAndExit("Could not determine the owner of this repo (e.g. 'screenplaydev' in the repo 'screenplaydev/graphite-cli'). Please run `gp repo-config owner --set <owner>` to manually set the repo owner.");
}
exports.getRepoOwner = getRepoOwner;
function setRepoOwner(owner) {
    repoConfig.owner = owner;
    persistRepoConfig(repoConfig);
}
exports.setRepoOwner = setRepoOwner;
function getRepoName() {
    if (repoConfig.name) {
        return repoConfig.name;
    }
    const inferredInfo = inferRepoGitHubInfo();
    if (inferredInfo === null || inferredInfo === void 0 ? void 0 : inferredInfo.repoName) {
        return inferredInfo.repoName;
    }
    utils_1.logErrorAndExit("Could not determine the name of this repo (e.g. 'graphite-cli' in the repo 'screenplaydev/graphite-cli'). Please run `gp repo-config name --set <owner>` to manually set the repo name.");
}
exports.getRepoName = getRepoName;
function setRepoName(name) {
    repoConfig.name = name;
    persistRepoConfig(repoConfig);
}
exports.setRepoName = setRepoName;
function persistRepoConfig(config) {
    fs_extra_1.default.writeFileSync(exports.CURRENT_REPO_CONFIG_PATH, JSON.stringify(config));
}
exports.trunkBranches = repoConfig.trunkBranches;
function inferRepoGitHubInfo() {
    // This assumes that the remote to use is named 'origin' and that the remote
    // to fetch from is the same as the remote to push to. If a user runs into
    // an issue where any of these invariants are not true, they can manually
    // edit the repo config file to overrule what our CLI tries to intelligently
    // infer.
    const url = utils_1.gpExecSync({
        command: `git config --get remote.origin.url`,
    }, (_) => {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    if (!url || url.length === 0) {
        return null;
    }
    let regex = undefined;
    if (url.startsWith("git@github.com")) {
        regex = /git@github.com:([^/]+)\/(.+)?.git/;
    }
    else if (url.startsWith("https://")) {
        regex = /https:\/\/github.com\/([^/]+)\/(.+)?.git/;
    }
    else {
        return null;
    }
    // e.g. in screenplaydev/graphite-cli we're trying to get the owner
    // ('screenplaydev') and the repo name ('graphite-cli')
    const matches = regex.exec(url);
    const owner = matches === null || matches === void 0 ? void 0 : matches[1];
    const name = matches === null || matches === void 0 ? void 0 : matches[2];
    if (owner === undefined || name === undefined) {
        return null;
    }
    return {
        repoOwner: owner,
        repoName: name,
    };
}
//# sourceMappingURL=repo_config.js.map