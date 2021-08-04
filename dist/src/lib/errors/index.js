"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigError = exports.ValidationFailedError = exports.RebaseConflictError = exports.PreconditionsFailedError = exports.ExitFailedError = exports.ExitError = void 0;
class ExitError extends Error {
}
exports.ExitError = ExitError;
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
//# sourceMappingURL=index.js.map