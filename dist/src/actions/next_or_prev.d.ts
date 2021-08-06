#!/usr/bin/env node
export declare function nextOrPrevAction(opts: {
    nextOrPrev: "next" | "prev";
    numSteps: number;
    silent: boolean;
    interactive: boolean;
}): Promise<void>;
