"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const git_repo_1 = __importDefault(require("../../test/utils/git_repo"));
const abstract_demo_1 = __importDefault(require("./abstract_demo"));
class SubmitDemo extends abstract_demo_1.default {
    constructor() {
        super("submit", [
            "# First, lets see our state of the world",
            "gp stacks",
            "# Let's create PR's for our stack",
            "gp stack submit",
            "# Now we make some changes",
            'git checkout gf--server && echo "abc" > ./abc && git add .',
            "gp branch amend",
            'git checkout gf--api && echo "dfg" > ./dfg && git add .',
            "gp branch amend",
            "# All these changes can be pushed to github",
            "gp stack submit",
            "# Thanks for watching",
            "# Good luck and let us know if you have questions!",
            "sleep 5",
        ], (demoDir) => {
            const repo = new git_repo_1.default(demoDir);
            repo.createChangeAndStackedBranch("gf--fix");
            repo.checkoutBranch("main");
            repo.createChangeAndStackedBranch("gf--server");
            repo.createChangeAndStackedBranch("gf--api");
            repo.createChangeAndStackedBranch("gf--frontend");
        });
    }
}
exports.default = SubmitDemo;
//# sourceMappingURL=submit_demo.js.map