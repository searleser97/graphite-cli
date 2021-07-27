"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trunkBranches = exports.repoConfig = exports.setUserAuthToken = exports.userConfig = exports.makeId = exports.CURRENT_REPO_CONFIG_PATH = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const exec_sync_1 = require("./exec_sync");
const splog_1 = require("./splog");
const CONFIG_NAME = ".graphite_repo_config";
const USER_CONFIG_PATH = path_1.default.join(os_1.default.homedir(), CONFIG_NAME);
exports.CURRENT_REPO_CONFIG_PATH = (() => {
    const repoRootPath = exec_sync_1.gpExecSync({
        command: `git rev-parse --show-toplevel`,
    }, (e) => {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    if (!repoRootPath || repoRootPath.length === 0) {
        splog_1.logErrorAndExit("No .git repository found.");
    }
    return path_1.default.join(repoRootPath, CONFIG_NAME);
})();
function makeId(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.makeId = makeId;
// TODO: validate the shape of this (possibly using retype)
exports.userConfig = {};
if (fs_extra_1.default.existsSync(USER_CONFIG_PATH)) {
    const userConfigRaw = fs_extra_1.default.readFileSync(USER_CONFIG_PATH);
    try {
        exports.userConfig = JSON.parse(userConfigRaw.toString().trim());
    }
    catch (e) {
        console.log(chalk_1.default.yellow(`Warning: Malformed ${USER_CONFIG_PATH}`));
    }
}
function setUserAuthToken(authToken) {
    const newConfig = Object.assign(Object.assign({}, exports.userConfig), { authToken: authToken });
    setUserConfig(newConfig);
}
exports.setUserAuthToken = setUserAuthToken;
function setUserConfig(config) {
    fs_extra_1.default.writeFileSync(USER_CONFIG_PATH, JSON.stringify(config));
    exports.userConfig = config;
}
exports.repoConfig = {};
if (fs_extra_1.default.existsSync(exports.CURRENT_REPO_CONFIG_PATH)) {
    const repoConfigRaw = fs_extra_1.default.readFileSync(exports.CURRENT_REPO_CONFIG_PATH);
    try {
        exports.repoConfig = JSON.parse(repoConfigRaw.toString().trim());
    }
    catch (e) {
        console.log(chalk_1.default.yellow(`Warning: Malformed ${exports.CURRENT_REPO_CONFIG_PATH}`));
    }
}
initializeRepoConfigWithInferredInfo();
function initializeRepoConfigWithInferredInfo() {
    const githubInfo = inferRepoGitHubInfo();
    if (githubInfo === null) {
        return;
    }
    // If the repo config already has these fields populated, we skip inferring
    // them (the user may have manually modified their config).
    if (exports.repoConfig.owner === undefined) {
        setRepoConfig(Object.assign(Object.assign({}, exports.repoConfig), { owner: githubInfo.owner }));
    }
    if (exports.repoConfig.repoName === undefined) {
        setRepoConfig(Object.assign(Object.assign({}, exports.repoConfig), { repoName: githubInfo.name }));
    }
}
function inferRepoGitHubInfo() {
    // This assumes that the remote to use is named 'origin' and that the remote
    // to fetch from is the same as the remote to push to. If a user runs into
    // an issue where any of these invariants are not true, they can manually
    // edit the repo config file to overrule what our CLI tries to intelligently
    // infer.
    const url = exec_sync_1.gpExecSync({
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
        owner: owner,
        name: name,
    };
}
function setRepoConfig(config) {
    fs_extra_1.default.writeFileSync(exports.CURRENT_REPO_CONFIG_PATH, JSON.stringify(config));
    exports.repoConfig = config;
}
exports.trunkBranches = exports.repoConfig.trunkBranches;
//# sourceMappingURL=config.js.map