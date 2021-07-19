import { execSync } from "child_process";

export default class Commit {
  sha: string;
  constructor(sha: string) {
    if (sha.length != 40) {
      throw new Error(
        `Commit sha must be 40 characters long. Attempted sha = "${sha}"`
      );
    }
    this.sha = sha;
  }
  public parents(): Commit[] {
    try {
      return execSync(`git rev-parse ${this.sha}`)
        .toString()
        .trim()
        .split("\n")
        .map((parentSha) => new Commit(parentSha));
    } catch (e) {
      return [];
    }
  }
  public setParent(commit: Commit): void {
    // execSync(`git rebase --onto ${commit.sha} ${this.sha} -Xtheirs`);
  }
}
