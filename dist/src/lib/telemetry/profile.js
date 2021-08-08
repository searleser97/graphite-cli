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
exports.profile = void 0;
const _1 = require(".");
const package_json_1 = require("../../../package.json");
const init_1 = require("../../actions/init");
const config_1 = require("../config");
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const context_1 = require("./context");
const tracer_1 = __importDefault(require("./tracer"));
function profile(args, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        // Self heal repo config on all commands besides init:
        const parsedArgs = utils_1.parseArgs(args);
        if (parsedArgs.command !== "repo init" && !config_1.repoConfig.getTrunk()) {
            utils_1.logInfo(`No trunk branch specified in "${config_1.repoConfig.path()}", please choose now.`);
            yield init_1.init();
        }
        const start = Date.now();
        const numCommits = context_1.getNumCommitObjects();
        const numBranches = context_1.getNumBranches();
        try {
            yield tracer_1.default.span({
                name: "command",
                resource: parsedArgs.command,
                meta: Object.assign(Object.assign({ user: context_1.getUserEmail() || "NotFound", version: package_json_1.version, args: parsedArgs.args, alias: parsedArgs.alias }, (numCommits ? { commits: numCommits.toString() } : {})), (numBranches ? { branches: numBranches.toString() } : {})),
            }, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield handler();
                }
                catch (err) {
                    if (err instanceof errors_1.ExitFailedError) {
                        utils_1.logError(err.message);
                    }
                    else if (err instanceof errors_1.PreconditionsFailedError) {
                        utils_1.logInfo(err.message);
                    }
                    else if (err instanceof errors_1.RebaseConflictError) {
                        utils_1.logWarn(`Rebase conflict: ${err.message}`);
                        return; // Dont throw error here.
                    }
                    else if (err instanceof errors_1.ValidationFailedError) {
                        utils_1.logError(`Validation: ${err.message}`);
                        utils_1.logInfo(utils_1.VALIDATION_HELPER_MESSAGE);
                    }
                    else if (err instanceof errors_1.ConfigError) {
                        utils_1.logError(`Bad Config: ${err.message}`);
                    }
                    else if (err instanceof errors_1.ExitCancelledError) {
                        utils_1.logWarn(`Cancelled: ${err.message}`);
                        return; // Dont throw error here.
                    }
                    throw err;
                }
            }));
        }
        catch (err) {
            const end = Date.now();
            _1.postTelemetryInBackground({
                commandName: parsedArgs.command,
                durationMiliSeconds: end - start,
                err,
            });
            // eslint-disable-next-line no-restricted-syntax
            process.exit(1);
        }
        const end = Date.now();
        _1.postTelemetryInBackground({
            commandName: parsedArgs.command,
            durationMiliSeconds: end - start,
        });
    });
}
exports.profile = profile;
//# sourceMappingURL=profile.js.map