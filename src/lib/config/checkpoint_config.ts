import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { logDebug } from "../utils";
import { getRepoRootPath } from "./repo_root_path";

const CONFIG_NAME = ".graphite_checkpoint";
const CURRENT_REPO_CONFIG_PATH = path.join(getRepoRootPath(), CONFIG_NAME);

export type OntoCheckpointT = {
  currentBranchName: string;
  onto: string;
};

type CheckpointT =
  | {
      action: "ONTO";
      args: OntoCheckpointT;
    }
  | undefined;

export function recordCheckpoint(checkpoint: CheckpointT): void {
  if (checkpoint !== undefined) {
    fs.writeFileSync(
      CURRENT_REPO_CONFIG_PATH,
      JSON.stringify(checkpoint, null, 2)
    );
  }
}

export function getMostRecentCheckpoint(): CheckpointT {
  if (fs.existsSync(CURRENT_REPO_CONFIG_PATH)) {
    const repoConfigRaw = fs.readFileSync(CURRENT_REPO_CONFIG_PATH);
    try {
      return JSON.parse(repoConfigRaw.toString().trim()) as CheckpointT;
    } catch (e) {
      logDebug(chalk.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`));
    }
  }
  return undefined;
}
