import yargs from "yargs";
import { topBranchAction } from "../../actions/next_or_prev";
import { profile } from "../../lib/telemetry";
import {execStateConfig} from "../../lib/config";

const args = {
    // steps: {
    //     describe: `The number of levels to traverse downstack.`,
    //     demandOption: false,
    //     default: 1,
    //     type: "number",
    //     alias: "n",
    // },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "top";
export const aliases = ["t"];
export const description =
    "If you're in a stack: Branch A → Branch B (you are here) → Branch C → Branch D , checkout the branch at the top of the stack (Branch D). If there are multiple parent branches in the stack, `gt top` will prompt you to choose which branch to checkout.";

export const handler = async (argv: argsT): Promise<void> => {
    return profile(argv, async () => {
        await topBranchAction({
            interactive: execStateConfig.interactive(),
        });
    });
};
