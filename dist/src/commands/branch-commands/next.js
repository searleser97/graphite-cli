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
const telemetry_1 = require("../../lib/telemetry");
const args = {
    steps: {
        describe: `number of branches to traverse`,
        demandOption: false,
        default: 1,
        type: "number",
        alias: "n",
    },
    interactive: {
        describe: `Enable interactive branch picking when necessary`,
        demandOption: false,
        default: true,
        type: "boolean",
        alias: "i",
    },
};
exports.command = "next [steps]";
exports.aliases = ["n"];
exports.description = "If you're in a stack: Branch A → Branch B (you are here) → Branch C. Takes you to the next branch (Branch C). If there are two descendent branches, errors out and tells you the various branches you could go to.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        yield next_or_prev_1.nextOrPrevAction({
            nextOrPrev: "next",
            numSteps: argv.steps,
            interactive: argv.interactive,
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=next.js.map