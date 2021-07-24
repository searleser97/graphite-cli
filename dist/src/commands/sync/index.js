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
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const prompts_1 = __importDefault(require("prompts"));
const log_1 = require("../../lib/log");
const utils_1 = require("../../lib/utils");
const branch_1 = __importDefault(require("../../wrapper-classes/branch"));
const abstract_command_1 = __importDefault(require("../abstract_command"));
const fix_1 = __importDefault(require("../fix"));
const restack_1 = __importDefault(require("../restack"));
const args = {
    trunk: {
        type: "string",
        describe: "The name of your trunk branch that stacks get merged into.",
        required: true,
        alias: "t",
    },
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
    force: {
        describe: `Don't prompt on each branch to confirm deletion.`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "f",
    },
    pull: {
        describe: `Pull the trunk branch before comparison.`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "p",
    },
};
class SyncCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            yield sync(argv);
        });
    }
}
exports.default = SyncCommand;
SyncCommand.args = args;
function sync(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const oldBranch = branch_1.default.getCurrentBranch();
        if (oldBranch === null) {
            utils_1.logWarn("Not currently on a branch; no stack to sync.");
            return;
        }
        const oldBranchName = oldBranch.name;
        utils_1.checkoutBranch(opts.trunk);
        if (opts.pull) {
            utils_1.gpExecSync({ command: `git pull` }, () => {
                utils_1.checkoutBranch(oldBranchName);
                utils_1.logInternalErrorAndExit(`Failed to pull trunk ${opts.trunk}`);
            });
        }
        const trunkChildren = yield new branch_1.default(opts.trunk).getChildrenFromMeta();
        do {
            const branch = trunkChildren.pop();
            const children = yield branch.getChildrenFromMeta();
            if (!shouldDeleteBranch(branch.name, opts.trunk)) {
                continue;
            }
            for (const child of children) {
                utils_1.checkoutBranch(child.name);
                log_1.log(`Restacking (${child.name}) onto (${opts.trunk})`);
                yield new restack_1.default().executeUnprofiled({
                    onto: opts.trunk,
                    silent: true,
                });
                trunkChildren.push(child);
            }
            utils_1.checkoutBranch(opts.trunk);
            yield deleteBranch(branch.name, opts);
            yield new fix_1.default().executeUnprofiled({ silent: true });
        } while (trunkChildren.length > 0);
        utils_1.checkoutBranch(oldBranchName);
    });
}
function shouldDeleteBranch(branchName, trunk) {
    const cherryCheckProvesMerged = child_process_1.execSync(`mergeBase=$(git merge-base ${trunk} ${branchName}) && git cherry ${trunk} $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $mergeBase -m _)`)
        .toString()
        .trim()
        .startsWith("-");
    if (cherryCheckProvesMerged) {
        return true;
    }
    const diffCheckProvesMerged = child_process_1.execSync(`git diff ${branchName} ${trunk}`).toString().trim().length == 0;
    if (diffCheckProvesMerged) {
        return true;
    }
    return false;
}
function deleteBranch(branchName, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!opts.force) {
            const response = yield prompts_1.default({
                type: "confirm",
                name: "value",
                message: `Delete (${chalk_1.default.green(branchName)}), which has been merged into (${opts.trunk})?`,
                initial: true,
            });
            if (response.value != true) {
                process.exit(0);
            }
        }
        else {
            log_1.log(`Deleting ${branchName}`, opts);
        }
        child_process_1.execSync(`git branch -D ${branchName}`);
    });
}
//# sourceMappingURL=index.js.map