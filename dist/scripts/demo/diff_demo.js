"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec_cli_command_1 = require("../../test/utils/exec_cli_command");
const git_repo_1 = __importDefault(require("../../test/utils/git_repo"));
const abstract_demo_1 = __importDefault(require("./abstract_demo"));
class DiffDemo extends abstract_demo_1.default {
    constructor() {
        super("diff", [
            "# First, lets show the current stacks",
            "gp stacks",
            'echo "new change" > ./frontend_change',
            "git add ./frontend_change",
            "gp branch create 'gr--frontend' -m 'feat(frontend): add review queue filter frontend'",
            "# Now, lets see the stacks after diff-ing",
            "gp stacks",
            "sleep 5",
        ], (demoDir) => {
            const repo = new git_repo_1.default(demoDir);
            repo.createChangeAndCommit("First commit");
            repo.createChangeAndCommit("Second commit");
            repo.createChange("[Product] Add review queue filter api");
            exec_cli_command_1.execCliCommand("branch create 'tr--api' -m '[Product] Add review queue filter api'", { fromDir: demoDir });
            repo.createChange("[Product] Add review queue filter server");
            exec_cli_command_1.execCliCommand("branch create 'tr--server' -m '[Product] Add review queue filter server'", { fromDir: demoDir });
            repo.checkoutBranch("main");
            repo.createChange("[Bug Fix] Fix crashes on reload");
            exec_cli_command_1.execCliCommand("branch create 'tr--fix_crash' -m '[Bug Fix] Fix crashes on reload'", { fromDir: demoDir });
            repo.checkoutBranch("main");
            repo.createChange("[Bug Fix] Account for empty state");
            exec_cli_command_1.execCliCommand("branch create 'tr--account_for_empty_state' -m '[Bug Fix] Account for empty state'", { fromDir: demoDir });
            repo.checkoutBranch("tr--server");
        });
    }
}
exports.default = DiffDemo;
//# sourceMappingURL=diff_demo.js.map