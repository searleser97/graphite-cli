import { gpExecSync } from "../../lib/utils/exec_sync";
import { cache } from "../config";
import { logError } from "./splog";

export function getRepoRootPath(): string {
  const cachedRepoRootPath = cache.getRepoRootPath();
  if (cachedRepoRootPath) {
    return cachedRepoRootPath;
  }
  const repoRootPath = gpExecSync(
    {
      command: `git rev-parse --git-dir`,
    },
    () => {
      return Buffer.alloc(0);
    }
  )
    .toString()
    .trim();
  if (!repoRootPath || repoRootPath.length === 0) {
    logError("No .git repository found.");
    // eslint-disable-next-line no-restricted-syntax
    process.exit(1);
  }
  cache.setRepoRootPath(repoRootPath);
  return repoRootPath;
}
