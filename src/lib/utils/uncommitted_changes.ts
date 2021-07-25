import { gpExecSync, logErrorAndExit } from ".";
export function uncommittedChanges(): boolean {
  return (
    gpExecSync(
      {
        command: `git status --porcelain=v1 2>/dev/null | wc -l`,
      },
      () => {
        logErrorAndExit(`Failed to check current dir for uncommitted changes.`);
      }
    )
      .toString()
      .trim() !== "0"
  );
}
