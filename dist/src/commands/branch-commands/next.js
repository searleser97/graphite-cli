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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.command = void 0;
const next_or_prev_1 = require("../../actions/next_or_prev");
const config_1 = require("../../lib/config");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    steps: {
        describe: `The number of levels to traverse upstack.`,
        demandOption: false,
        default: 1,
        type: "number",
        alias: "n",
    },
};
exports.command = "next [steps]";
exports.aliases = ["n"];
exports.description = "If you're in a stack, i.e. Branch A → Branch B (you are here) → Branch C, checkout the branch directly upstack (Branch C). If there are multiple child branches above in the stack, `gt next` will prompt you to choose which branch to checkout.  Pass the `steps` arg to checkout the branch `[steps]` levels above in the stack.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        yield next_or_prev_1.nextOrPrevAction({
            nextOrPrev: "next",
            numSteps: argv.steps,
            interactive: config_1.execStateConfig.interactive(),
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=next.js.map