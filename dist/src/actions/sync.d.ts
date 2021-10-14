export declare function syncAction(opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    resubmit: boolean;
    fixDanglingBranches: boolean;
}): Promise<void>;
