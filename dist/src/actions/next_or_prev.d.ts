#!/usr/bin/env node
export declare function nextOrPrevAction(opts: {
    nextOrPrev: "next" | "prev";
    numSteps: number;
    interactive: boolean;
}): Promise<void>;
