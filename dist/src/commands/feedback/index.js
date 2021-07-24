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
const node_fetch_1 = __importDefault(require("node-fetch"));
const telemetry_1 = require("../../lib/telemetry");
const abstract_command_1 = __importDefault(require("../abstract_command"));
const args = {
    message: {
        type: "string",
        postitional: true,
        describe: "Postive or constructive. Jokes are chill too.",
    },
};
class FeedbackCommand extends abstract_command_1.default {
    _execute(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = telemetry_1.userEmail();
            const response = yield node_fetch_1.default(`https://api.graphite.dev/v1/graphite/feedback`, {
                method: "POST",
                body: JSON.stringify({
                    user: user || "NotFound",
                    message: argv.message,
                }),
            });
            if (response.status == 200) {
                console.log(chalk_1.default.green(`Feedback received loud and clear (in a team Slack channel) :)`));
            }
            else {
                console.log(chalk_1.default.yellow(`Failed to report feedback, network response ${response.status}`));
                process.exit(1);
            }
        });
    }
}
exports.default = FeedbackCommand;
FeedbackCommand.args = args;
//# sourceMappingURL=index.js.map