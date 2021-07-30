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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restackBranch = exports.fixAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const print_stacks_1 = __importDefault(require("../commands/original-commands/print-stacks"));
const log_1 = require("../lib/log");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
function fixAction(silent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.uncommittedChanges()) {
            utils_1.logErrorAndExit("Cannot fix with uncommitted changes");
        }
        // Print state before
        log_1.log(`Before fix:`, { silent });
        !silent && (yield new print_stacks_1.default().executeUnprofiled({ silent }));
        const originalBranch = branch_1.default.getCurrentBranch();
        if (originalBranch === null) {
            utils_1.logErrorAndExit(`Not currently on a branch; no target to fix.`);
        }
        for (const child of yield originalBranch.getChildrenFromMeta()) {
            yield restackBranch(child, silent);
        }
        utils_1.checkoutBranch(originalBranch.name);
        // Print state after
        log_1.log(`After fix:`, { silent });
        !silent && (yield new print_stacks_1.default().executeUnprofiled({ silent }));
    });
}
exports.fixAction = fixAction;
function restackBranch(currentBranch, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.rebaseInProgress()) {
            utils_1.logErrorAndExit(`Interactive rebase in progress, cannot fix (${currentBranch.name}). Complete the rebase and re-run fix command.`);
        }
        const parentBranch = currentBranch.getParentFromMeta();
        if (!parentBranch) {
            utils_1.logErrorAndExit(`Cannot find parent in stack for (${currentBranch.name}), stopping fix`);
        }
        const mergeBase = currentBranch.getMetaMergeBase();
        if (!mergeBase) {
            utils_1.logErrorAndExit(`Cannot find a merge base in the stack for (${currentBranch.name}), stopping fix`);
        }
        currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
        utils_1.checkoutBranch(currentBranch.name);
        utils_1.gpExecSync({
            command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${currentBranch.name}`,
            options: { stdio: "ignore" },
        }, () => {
            if (utils_1.rebaseInProgress()) {
                log_1.log(chalk_1.default.yellow("Please resolve the rebase conflict and then continue with your `stack fix` command."));
                process.exit(0);
            }
        });
        for (const child of yield currentBranch.getChildrenFromMeta()) {
            yield restackBranch(child, silent);
        }
    });
}
exports.restackBranch = restackBranch;
//# sourceMappingURL=fix.js.map