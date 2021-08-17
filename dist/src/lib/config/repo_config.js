"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/utils");
const errors_2 = require("../errors");
const currentGitRepoPrecondition = () => {
    const repoRootPath = utils_1.gpExecSync({
        command: `git rev-parse --git-dir`,
    }, () => {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    if (!repoRootPath || repoRootPath.length === 0) {
        throw new errors_2.PreconditionsFailedError("No .git repository found.");
    }
    return repoRootPath;
};
const CONFIG_NAME = ".graphite_repo_config";
const CURRENT_REPO_CONFIG_PATH = path_1.default.join(currentGitRepoPrecondition(), CONFIG_NAME);
class RepoConfig {
    constructor(data) {
        this._data = data;
    }
    save() {
        fs_extra_1.default.writeFileSync(CURRENT_REPO_CONFIG_PATH, JSON.stringify(this._data, null, 2));
    }
    getRepoOwner() {
        const configOwner = this._data.owner;
        if (configOwner) {
            return configOwner;
        }
        const inferredInfo = inferRepoGitHubInfo();
        if (inferredInfo === null || inferredInfo === void 0 ? void 0 : inferredInfo.repoOwner) {
            return inferredInfo.repoOwner;
        }
        throw new errors_1.ExitFailedError("Could not determine the owner of this repo (e.g. 'screenplaydev' in the repo 'screenplaydev/graphite-cli'). Please run `gt repo owner --set <owner>` to manually set the repo owner.");
    }
    path() {
        return CURRENT_REPO_CONFIG_PATH;
    }
    setTrunk(trunkName) {
        this._data.trunk = trunkName;
        this.save();
    }
    getTrunk() {
        return this._data.trunk;
    }
    setIgnoreBranches(ignoreBranches) {
        this._data.ignoreBranches = ignoreBranches;
        this.save();
    }
    getIgnoreBranches() {
        return this._data.ignoreBranches || [];
    }
    setRepoOwner(owner) {
        this._data.owner = owner;
        this.save();
    }
    getRepoName() {
        if (this._data.name) {
            return this._data.name;
        }
        const inferredInfo = inferRepoGitHubInfo();
        if (inferredInfo === null || inferredInfo === void 0 ? void 0 : inferredInfo.repoName) {
            return inferredInfo.repoName;
        }
        throw new errors_1.ExitFailedError("Could not determine the name of this repo (e.g. 'graphite-cli' in the repo 'screenplaydev/graphite-cli'). Please run `gt repo name --set <owner>` to manually set the repo name.");
    }
    setRepoName(name) {
        this._data.name = name;
        this.save();
    }
    getMaxDaysShownBehindTrunk() {
        var _a;
        this.migrateLogSettings();
        return (_a = this._data.maxDaysShownBehindTrunk) !== null && _a !== void 0 ? _a : 30;
    }
    setMaxDaysShownBehindTrunk(n) {
        this.migrateLogSettings();
        this._data.maxDaysShownBehindTrunk = n;
        this.save();
    }
    getMaxStacksShownBehindTrunk() {
        var _a;
        this.migrateLogSettings();
        return (_a = this._data.maxStacksShownBehindTrunk) !== null && _a !== void 0 ? _a : 10;
    }
    setMaxStacksShownBehindTrunk(n) {
        this.migrateLogSettings();
        this._data.maxStacksShownBehindTrunk = n;
        this.save();
    }
    /**
     * These settings used to (briefly) live in logSettings. Moving these to live
     * in the top-level namespace now that they're shared between multiple
     * commands (e.g. log and stacks).
     */
    migrateLogSettings() {
        var _a, _b;
        const maxStacksShownBehindTrunk = (_a = this._data.logSettings) === null || _a === void 0 ? void 0 : _a.maxStacksShownBehindTrunk;
        if (maxStacksShownBehindTrunk !== undefined) {
            this._data.maxStacksShownBehindTrunk = maxStacksShownBehindTrunk;
        }
        const maxDaysShownBehindTrunk = (_b = this._data.logSettings) === null || _b === void 0 ? void 0 : _b.maxDaysShownBehindTrunk;
        if (maxDaysShownBehindTrunk !== undefined) {
            this._data.maxDaysShownBehindTrunk = maxDaysShownBehindTrunk;
        }
        this._data.logSettings = undefined;
        this.save();
    }
}
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
function readRepoConfig() {
    if (fs_extra_1.default.existsSync(CURRENT_REPO_CONFIG_PATH)) {
        const repoConfigRaw = fs_extra_1.default.readFileSync(CURRENT_REPO_CONFIG_PATH);
        try {
            const parsedConfig = JSON.parse(repoConfigRaw.toString().trim());
            return new RepoConfig(parsedConfig);
        }
        catch (e) {
            console.log(chalk_1.default.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`));
        }
    }
    return new RepoConfig({});
}
const repoConfigSingleton = readRepoConfig();
exports.default = repoConfigSingleton;
//# sourceMappingURL=repo_config.js.map