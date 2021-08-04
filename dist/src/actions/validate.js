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
exports.validate = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../lib/errors");
const log_1 = require("../lib/log");
const preconditions_1 = require("../lib/preconditions");
function validate(scope, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        const branch = preconditions_1.currentBranchPrecondition();
        switch (scope) {
            case "UPSTACK":
                yield validateBranchUpInclusive(branch, silent);
                break;
            case "DOWNSTACK":
                yield validateBranchDownInclusive(branch, silent);
                break;
            case "FULLSTACK":
                yield validateBranchDownInclusive(branch, silent);
                yield validateBranchUpInclusive(branch, silent);
                break;
        }
        log_1.log(`Current stack is valid`, { silent: silent });
    });
}
exports.validate = validate;
function validateBranchDownInclusive(branch, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        const metaParent = yield branch.getParentFromMeta();
        const gitParents = branch.getParentsFromGit();
        const metaParentMatchesBranchWithSameHead = !!metaParent &&
            !!branch.branchesWithSameCommit().find((b) => b.name == metaParent.name);
        if (gitParents.length === 0 && !metaParent) {
            return;
        }
        if (gitParents.length === 0 &&
            metaParent &&
            !metaParentMatchesBranchWithSameHead) {
            throw new errors_1.ValidationFailedError(`(${branch.name}) has stack parent (${metaParent.name}), but no parent in the git graph.`);
        }
        if (gitParents.length === 1 && !metaParent) {
            throw new errors_1.ValidationFailedError(`(${branch.name}) has git parent (${gitParents[0].name}), but no parent in the stack.`);
        }
        if (gitParents.length > 1) {
            throw new errors_1.ValidationFailedError(`(${branch.name}) has more than one git parent (${gitParents.map((b) => b.name)}).`);
        }
        if (!metaParent) {
            throw new errors_1.ValidationFailedError("Unreachable");
        }
        if (!metaParentMatchesBranchWithSameHead &&
            gitParents[0].name !== metaParent.name) {
            throw new errors_1.ValidationFailedError(`(${branch.name}) has git parent (${gitParents[0].name}) but stack parent (${metaParent.name})`);
        }
        yield validateBranchDownInclusive(metaParent, silent);
        return;
    });
}
function validateBranchUpInclusive(branch, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        const metaChildren = yield branch.getChildrenFromMeta();
        const gitChildren = branch.getChildrenFromGit();
        const hasGitChildren = gitChildren && gitChildren.length > 0;
        const hasMetaChildren = metaChildren.length > 0;
        if (!hasGitChildren && !hasMetaChildren) {
            // Assume to be a trunk branch and implicately valid.
            log_1.log(`✅ ${chalk_1.default.green(`(${branch.name}) validated`)}`, { silent });
            return;
        }
        const gitChildrenMissingInMeta = gitChildren.filter((gitChild) => !metaChildren.map((b) => b.name).includes(gitChild.name));
        if (gitChildrenMissingInMeta.length > 0) {
            throw new Error(`Child branches [${gitChildrenMissingInMeta
                .map((b) => `(${b.name})`)
                .join(", ")}] not found in the stack.`);
        }
        const gitChildrenAndEquals = gitChildren.concat(branch.branchesWithSameCommit());
        const metaChildrenMissingInGit = metaChildren.filter((metaChild) => !gitChildrenAndEquals.find((b) => b.name === metaChild.name));
        if (metaChildrenMissingInGit.length > 0) {
            throw new Error(`Stack children [${metaChildrenMissingInGit
                .map((b) => `(${b.name})`)
                .join(", ")}] not found as git child branchs.`);
        }
        log_1.log(`✅ ${chalk_1.default.green(`(${branch.name}) validated`)}`, { silent });
        for (const child of metaChildren) {
            yield validateBranchUpInclusive(child, silent);
        }
    });
}
//# sourceMappingURL=validate.js.map