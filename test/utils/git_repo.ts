import { execSync } from "child_process";
import fs from "fs-extra";

const TEXT_FILE_NAME = "test.txt";
export default class GitRepo {
  dir: string;
  constructor(dir: string) {
    this.dir = dir;
    execSync(`git init ${dir} -b main`);
  }

  createChange(textValue: string) {
    fs.writeFileSync(`${this.dir}/${TEXT_FILE_NAME}`, textValue);
  }

  createChangeAndCommit(textValue: string) {
    this.createChange(textValue);
    execSync(`git -C ${this.dir} add "${this.dir}/test.txt"`);
    execSync(`git -C ${this.dir} commit -m "${textValue}"`);
  }

  createAndCheckoutBranch(name: string) {
    execSync(`git -C ${this.dir} checkout -b "${name}"`, { stdio: "ignore" });
  }

  checkoutBranch(name: string) {
    execSync(`git -C ${this.dir} checkout "${name}"`, { stdio: "ignore" });
  }

  currentBranchName(): string {
    return execSync(`git -C ${this.dir} rev-parse --abbrev-ref HEAD`)
      .toString()
      .trim();
  }

  listCurrentBranchCommitMessages(): string[] {
    return execSync(`git -C ${this.dir} log --oneline  --format=%B`)
      .toString()
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);
  }
}
