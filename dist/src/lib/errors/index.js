"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiParentError = exports.SiblingBranchError = exports.ExitCancelledError = exports.ConfigError = exports.ValidationFailedError = exports.RebaseConflictError = exports.PreconditionsFailedError = exports.ExitFailedError = exports.ExitError = void 0;
class ExitError extends Error {
}
exports.ExitError = ExitError;
class ExitCancelledError extends ExitError {
    constructor(message) {
        super(message);
        this.name = "ExitCancelled";
    }
}
exports.ExitCancelledError = ExitCancelledError;
class ExitFailedError extends ExitError {
    constructor(message) {
        super(message);
        this.name = "ExitFailed";
    }
}
exports.ExitFailedError = ExitFailedError;
class RebaseConflictError extends ExitError {
    constructor(message) {
        super(message);
        this.name = "RebaseConflict";
    }
}
exports.RebaseConflictError = RebaseConflictError;
class ValidationFailedError extends ExitError {
    constructor(message) {
        super(message);
        this.name = "ValidationFailed";
    }
}
exports.ValidationFailedError = ValidationFailedError;
class PreconditionsFailedError extends ExitError {
    constructor(message) {
        super(message);
        this.name = "PreconditionsFailed";
    }
}
exports.PreconditionsFailedError = PreconditionsFailedError;
class ConfigError extends ExitError {
    constructor(message) {
        super(message);
        this.name = "Config";
    }
}
exports.ConfigError = ConfigError;
class SiblingBranchError extends ExitError {
    constructor(branches) {
        super([
            `Multiple branches pointing to commit ${branches[0].ref()}.`,
            `Graphite cannot infer parent-child relationships between identical branches.`,
            `Please add a commit to one, or delete one to continue:`,
            ...branches.map((b) => `-> (${b.name})`),
        ].join("\n"));
        this.name = `SiblingBranchError`;
    }
}
exports.SiblingBranchError = SiblingBranchError;
class MultiParentError extends ExitError {
    constructor(branch, parents) {
        super([
            `Multiple git commit parents detected for ${branch.name}.`,
            `Graphite does not support multi-parent branches in stacks.`,
            `Please adjust the git commit tree or delete one of the parents:`,
            ...parents.map((b) => `-> (${b.name})`),
        ].join("\n"));
        this.name = `ParentBranchError`;
    }
}
exports.MultiParentError = MultiParentError;
//# sourceMappingURL=index.js.map