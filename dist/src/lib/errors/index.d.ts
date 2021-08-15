declare class ExitError extends Error {
}
declare class ExitCancelledError extends ExitError {
    constructor(message: string);
}
declare class ExitFailedError extends ExitError {
    constructor(message: string);
}
declare class RebaseConflictError extends ExitError {
    constructor(message: string);
}
declare class ValidationFailedError extends ExitError {
    constructor(message: string);
}
declare class PreconditionsFailedError extends ExitError {
    constructor(message: string);
}
declare class ConfigError extends ExitError {
    constructor(message: string);
}
export { ExitError, ExitFailedError, PreconditionsFailedError, RebaseConflictError, ValidationFailedError, ConfigError, ExitCancelledError, };
