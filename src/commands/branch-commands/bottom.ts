import yargs from "yargs";
import { bottomBranchAction } from "../../actions/next_or_prev";
// import { execStateConfig } from "../../lib/config";
import { profile } from "../../lib/telemetry";

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

export const command = "bottom";
export const aliases = ["b"];
export const description =
    "If you're in a stack: Branch A → Branch B → Branch C (you are here), checkout the branch at the bottom of the stack (Branch A). If there are multiple parent branches in the stack, `gt bottom` will prompt you to choose which branch to checkout.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
    return profile(argv, async () => {
        await bottomBranchAction();
    });
};
