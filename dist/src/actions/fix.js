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
const prompts_1 = __importDefault(require("prompts"));
const config_1 = require("../lib/config");
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
const trunk_1 = require("../lib/utils/trunk");
const wrapper_classes_1 = require("../wrapper-classes");
function promptStacks(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield prompts_1.default({
            type: "select",
            name: "value",
            message: `Rebase branches or regerate stacks metadata?`,
            choices: ["rebase", "regen"].map((r) => {
                return {
                    title: r === "rebase"
                        ? `rebase branches, using Graphite stacks as truth (${chalk_1.default.green("common choice")})\n` +
                            opts.metaStack
                                .toString()
                                .split("\n")
                                .map((l) => "    " + l)
                                .join("\n") +
                            "\n"
                        : `regen stack metadata, using Git commit tree as truth\n` +
                            opts.gitStack
                                .toString()
                                .split("\n")
                                .map((l) => "    " + l)
                                .join("\n") +
                            "\n",
                    value: r,
                };
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            }),
        });
        if (!response.value) {
            throw new errors_1.ExitCancelledError("No changes made");
        }
        return response.value;
    });
}
function fixAction(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = preconditions_1.currentBranchPrecondition();
        preconditions_1.uncommittedChangesPrecondition();
        const metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(currentBranch);
        const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(currentBranch);
        // Consider noop
        if (metaStack.equals(gitStack)) {
            utils_1.logInfo(`No fix needed`);
            return;
        }
        const action = opts.action || (yield promptStacks({ gitStack, metaStack }));
        if (action === "regen") {
            yield regen(currentBranch);
        }
        else {
            for (const child of metaStack.source.children) {
                yield restackNode(child);
            }
        }
        utils_1.checkoutBranch(currentBranch.name);
    });
}
exports.fixAction = fixAction;
function restackBranch(branch) {
    return __awaiter(this, void 0, void 0, function* () {
        const metaStack = new wrapper_classes_1.MetaStackBuilder().upstackInclusiveFromBranchWithParents(branch);
        yield restackNode(metaStack.source);
    });
}
exports.restackBranch = restackBranch;
function restackNode(node) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.rebaseInProgress()) {
            throw new errors_1.RebaseConflictError(`Interactive rebase in progress, cannot fix (${node.branch.name}). Complete the rebase and re-run fix command.`);
        }
        const parentBranch = (_a = node.parent) === null || _a === void 0 ? void 0 : _a.branch;
        if (!parentBranch) {
            throw new errors_1.ExitFailedError(`Cannot find parent in stack for (${node.branch.name}), stopping fix`);
        }
        const mergeBase = node.branch.getMetaMergeBase();
        if (!mergeBase) {
            throw new errors_1.ExitFailedError(`Cannot find a merge base in the stack for (${node.branch.name}), stopping fix`);
        }
        if (parentBranch.ref() === mergeBase) {
            utils_1.logInfo(`No fix needed for (${node.branch.name}) on (${parentBranch.name})`);
        }
        else {
            utils_1.logInfo(`Fixing (${chalk_1.default.green(node.branch.name)}) on (${parentBranch.name})`);
            utils_1.checkoutBranch(node.branch.name);
            node.branch.setMetaPrevRef(node.branch.getCurrentRef());
            utils_1.gpExecSync({
                command: `git rebase --onto ${parentBranch.name} ${mergeBase} ${node.branch.name}`,
                options: { stdio: "ignore" },
            }, () => {
                if (utils_1.rebaseInProgress()) {
                    throw new errors_1.RebaseConflictError("Resolve the conflict (via `git rebase --continue`) and then rerun `gt stack fix` to fix the remaining stack.");
                }
            });
            config_1.cache.clearAll();
        }
        for (const child of node.children) {
            yield restackNode(child);
        }
    });
}
function regen(branch) {
    return __awaiter(this, void 0, void 0, function* () {
        const trunk = trunk_1.getTrunk();
        if (trunk.name == branch.name) {
            regenAllStacks();
            return;
        }
        const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(branch);
        yield recursiveRegen(gitStack.source);
    });
}
function regenAllStacks() {
    const allGitStacks = new wrapper_classes_1.GitStackBuilder().allStacks();
    utils_1.logInfo(`Computing regenerating ${allGitStacks.length} stacks...`);
    allGitStacks.forEach((stack) => {
        utils_1.logInfo(`\nRegenerating:\n${stack.toString()}`);
        recursiveRegen(stack.source);
    });
}
function recursiveRegen(node) {
    var _a;
    // The only time we expect newParent to be undefined is if we're fixing
    // the base branch which is behind trunk.
    const branch = node.branch;
    // Set parents if not trunk
    if (branch.name !== trunk_1.getTrunk().name) {
        const oldParent = branch.getParentFromMeta();
        const newParent = ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.branch) || trunk_1.getTrunk();
        if (oldParent && oldParent.name === newParent.name) {
            utils_1.logInfo(`-> No change for (${branch.name}) with branch parent (${oldParent.name})`);
        }
        else {
            utils_1.logInfo(`-> Updating (${branch.name}) branch parent from (${oldParent === null || oldParent === void 0 ? void 0 : oldParent.name}) to (${chalk_1.default.green(newParent.name)})`);
            branch.setParentBranchName(newParent.name);
        }
    }
    node.children.forEach(recursiveRegen);
}
//# sourceMappingURL=fix.js.map