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
exports.amendAction = void 0;
const fix_1 = require("../actions/fix");
const git_utils_1 = require("../lib/git-utils");
const utils_1 = require("../lib/utils");
function amendAction(silent, message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (git_utils_1.workingTreeClean()) {
            utils_1.logInfo("No changes to amend.");
            return;
        }
        utils_1.gpExecSync({
            command: "git add --all",
        }, () => {
            utils_1.logInternalErrorAndExit("Failed to add changes. Aborting...");
        });
        utils_1.gpExecSync({
            command: `git commit -m "${message || "Updates"}"`,
        }, () => {
            utils_1.logInternalErrorAndExit("Failed to commit changes. Aborting...");
        });
        // Only restack if working tree is now clean.
        if (git_utils_1.workingTreeClean()) {
            yield fix_1.fixAction(silent);
        }
    });
}
exports.amendAction = amendAction;
//# sourceMappingURL=amend.js.map