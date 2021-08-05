#!/usr/bin/env node
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
exports.nextOrPrevAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const prompts_1 = __importDefault(require("prompts"));
const errors_1 = require("../lib/errors");
const preconditions_1 = require("../lib/preconditions");
const utils_1 = require("../lib/utils");
function getPrevBranch(currentBranch) {
    const branch = currentBranch.getParentFromMeta();
    return branch === null || branch === void 0 ? void 0 : branch.name;
}
function getNextBranch(currentBranch, interactive) {
    return __awaiter(this, void 0, void 0, function* () {
        const candidates = yield currentBranch.getChildrenFromMeta();
        if (candidates.length === 0) {
            return;
        }
        if (candidates.length > 1) {
            if (interactive) {
                return (yield prompts_1.default({
                    type: "select",
                    name: "branch",
                    message: "Select a branch to checkout",
                    choices: candidates.map((b) => {
                        return { title: b.name, value: b.name };
                    }),
                })).branch;
            }
            else {
                throw new errors_1.ExitFailedError(`Cannot get next branch, multiple choices available: [${candidates.join(", ")}]`);
            }
        }
        else {
            return candidates[0].name;
        }
    });
}
function nextOrPrevAction(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        // Support stepping over n branches.
        for (let i = 0; i < opts.numSteps; i++) {
            const currentBranch = preconditions_1.currentBranchPrecondition();
            const branch = opts.nextOrPrev === "next"
                ? yield getNextBranch(currentBranch, opts.interactive)
                : getPrevBranch(currentBranch);
            // Print indented branch names to show traversal.
            if (branch && branch !== currentBranch.name) {
                child_process_1.execSync(`git checkout "${branch}"`, { stdio: "ignore" });
                const indent = opts.nextOrPrev === "next" ? i : opts.numSteps - i - 1;
                utils_1.logInfo(`${"  ".repeat(indent)}↳(${i === opts.numSteps - 1 ? chalk_1.default.cyan(branch) : branch})`);
            }
            else {
                return;
            }
        }
    });
}
exports.nextOrPrevAction = nextOrPrevAction;
//# sourceMappingURL=next_or_prev.js.map