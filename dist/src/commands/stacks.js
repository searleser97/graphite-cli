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
exports.handler = exports.builder = exports.description = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
const telemetry_1 = require("../lib/telemetry");
const utils_1 = require("../lib/utils");
const branch_1 = __importDefault(require("../wrapper-classes/branch"));
const args = {
    all: {
        describe: `Show all branches.`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "a",
    },
    interactive: {
        describe: "Whether or not to show the interactive branch picker (set to false when using `gp stacks` as part of a shell script).",
        demandOption: false,
        default: true,
        type: "boolean",
        alias: "i",
    },
};
exports.command = "stacks";
exports.description = "Print stacks.";
exports.builder = args;
function computeBranchLineage() {
    const precomputedChildren = {};
    const rootBranches = [];
    branch_1.default.allBranches().forEach((branch) => {
        const parent = branch.getParentFromMeta();
        if (!parent) {
            rootBranches.push({
                branch,
                status: branch.getParentsFromGit().length > 0 ? "NEEDS_REGEN" : "TRACKED",
            });
        }
        else {
            if (!(parent.name in precomputedChildren)) {
                precomputedChildren[parent.name] = [];
            }
            precomputedChildren[parent.name].push({
                branch,
                status: branch.getParentsFromGit().some((gitParent) => {
                    return gitParent.name === parent.name;
                })
                    ? "TRACKED"
                    : "NEEDS_RESTACK",
            });
        }
    });
    return { rootBranches, precomputedChildren };
}
function computeChoices(branch, precomputedChildren, trunk, current, showAll, indent = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        const children = branch.branch.name in precomputedChildren
            ? precomputedChildren[branch.branch.name]
            : [];
        if (indent === 0 &&
            children.length === 0 &&
            branch.branch.name !== trunk.name &&
            !(current && branch.branch.name === current.name) &&
            !showAll) {
            return [];
        }
        let choices = [];
        choices.push({
            value: branch.branch.name,
            title: `${"  ".repeat(indent)}${chalk_1.default.gray("↳")} ${current && branch.branch.name === current.name
                ? chalk_1.default.cyan(branch.branch.name)
                : chalk_1.default.blueBright(branch.branch.name)} (${current && branch.branch.name === current.name
                ? `${chalk_1.default.cyan("current")}, `
                : ""}${indent > 0 ? `${indent} deep` : "root"}${{
                TRACKED: "",
                NEEDS_RESTACK: `, ${chalk_1.default.yellow("`stack fix` required")}`,
                NEEDS_REGEN: `, ${chalk_1.default.yellow("untracked")}`,
            }[branch.status]})`,
        });
        for (const child of children) {
            choices = choices.concat(yield computeChoices(child, precomputedChildren, trunk, current, showAll, indent + 1));
        }
        return choices;
    });
}
function promptBranches(choices) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = branch_1.default.getCurrentBranch();
        let currentBranchIndex = undefined;
        if (currentBranch) {
            currentBranchIndex = choices
                .map((c) => c.value)
                .indexOf(currentBranch.name);
        }
        const chosenBranch = (yield prompts_1.default(Object.assign({ type: "select", name: "branch", message: `Checkout a branch`, choices: choices }, (currentBranchIndex ? { initial: currentBranchIndex } : {})))).branch;
        if (!chosenBranch) {
            throw new errors_1.ExitCancelledError("No branch selected");
        }
        if (chosenBranch && chosenBranch !== (currentBranch === null || currentBranch === void 0 ? void 0 : currentBranch.name)) {
            utils_1.gpExecSync({ command: `git checkout ${chosenBranch}` }, (err) => {
                throw new errors_1.ExitFailedError(`Failed to checkout ${chosenBranch}: ${err}`);
            });
        }
    });
}
function promptBranchesAndChildren(all, interactive) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rootBranches, precomputedChildren } = computeBranchLineage();
        const trunk = utils_1.getTrunk();
        const current = branch_1.default.getCurrentBranch();
        let choices = [];
        for (const branch of rootBranches) {
            choices = choices.concat(yield computeChoices(branch, precomputedChildren, trunk, current, all));
        }
        if (interactive) {
            yield promptBranches(choices);
        }
        else {
            choices.forEach((choice) => {
                console.log(choice.title);
            });
            return;
        }
    });
}
const handler = (args) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(args, () => __awaiter(void 0, void 0, void 0, function* () {
        yield promptBranchesAndChildren(args.all, args.interactive);
    }));
});
exports.handler = handler;
//# sourceMappingURL=stacks.js.map