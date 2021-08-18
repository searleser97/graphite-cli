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
exports.commitAmendAction = void 0;
const child_process_1 = require("child_process");
const errors_1 = require("../lib/errors");
const git_utils_1 = require("../lib/git-utils");
const global_arguments_1 = require("../lib/global-arguments");
const utils_1 = require("../lib/utils");
const fix_1 = require("./fix");
function commitAmendAction(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (opts.addAll) {
            utils_1.gpExecSync({
                command: "git add --all",
            }, () => {
                throw new errors_1.ExitFailedError("Failed to add changes. Aborting...");
            });
        }
        try {
            child_process_1.execSync([
                `git commit --amend`,
                ...[
                    opts.noEdit
                        ? ["--no-edit"]
                        : opts.message
                            ? [`-m ${opts.message}`]
                            : [],
                ],
                ...[global_arguments_1.globalArgs.noVerify ? ["--no-verify"] : []],
            ].join(" "), { stdio: "inherit" });
        }
        catch (_a) {
            throw new errors_1.ExitFailedError("Failed to amend changes. Aborting...");
        }
        // Only restack if working tree is now clean.
        if (git_utils_1.workingTreeClean()) {
            yield fix_1.fixAction({ action: "rebase" });
        }
        else {
            utils_1.logWarn("Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix`");
        }
    });
}
exports.commitAmendAction = commitAmendAction;
//# sourceMappingURL=commit_amend.js.map