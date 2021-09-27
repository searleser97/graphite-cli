"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepoRootPath = void 0;
const exec_sync_1 = require("../../lib/utils/exec_sync");
const config_1 = require("../config");
const errors_1 = require("../errors");
function getRepoRootPath() {
    const cachedRepoRootPath = config_1.cache.getRepoRootPath();
    if (cachedRepoRootPath) {
        return cachedRepoRootPath;
    }
    const repoRootPath = exec_sync_1.gpExecSync({
        command: `git rev-parse --git-dir`,
    }, () => {
        return Buffer.alloc(0);
    })
        .toString()
        .trim();
    if (!repoRootPath || repoRootPath.length === 0) {
        throw new errors_1.PreconditionsFailedError("No .git repository found.");
    }
    config_1.cache.setRepoRootPath(repoRootPath);
    return repoRootPath;
}
exports.getRepoRootPath = getRepoRootPath;
//# sourceMappingURL=repo_root_path.js.map