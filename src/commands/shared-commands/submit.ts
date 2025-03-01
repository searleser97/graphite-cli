import yargs from "yargs";

export const command = "submit";

/**
 * Primary interaction patterns:
 *
 * # (default) allows user to edit PR fields inline and then submits stack as a draft
 * gt stack submit
 *
 * # skips editing PR fields inline, submits stack as a draft
 * gt stack submit --no-edit
 *
 * # allows user to edit PR fields inline, then publishes
 * gt stack submit --no-draft
 *
 * # same as gt stack submit --no-edit
 * gt stack submit --no-interactive
 *
 */
export const args = {
  draft: {
    describe:
      "Creates new PRs in draft mode. If --no-interactive is true, this is automatically set to true.",
    type: "boolean",
    alias: "d",
  },
  edit: {
    describe:
      "Edit PR fields inline. If --no-interactive is true, this is automatically set to false.",
    type: "boolean",
    default: true,
    alias: "e",
  },
  "dry-run": {
    describe:
      "Reports the PRs that would be submitted and terminates. No branches are pushed and no PRs are opened or updated.",
    type: "boolean",
    default: false,
  },
} as const;

export const builder = args;
export const aliases = ["s"];
export type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
