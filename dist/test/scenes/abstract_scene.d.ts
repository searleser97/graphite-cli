import tmp from "tmp";
import GitRepo from "../utils/git_repo";
export declare abstract class AbstractScene {
    tmpDir: tmp.DirResult;
    repo: GitRepo;
    dir: string;
    oldDir: string;
    constructor();
    abstract toString(): string;
    setup(): void;
    cleanup(): void;
}
