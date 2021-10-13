"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultEditor = void 0;
const exec_sync_1 = require("./exec_sync");
function getDefaultEditor() {
    const gitEditor = exec_sync_1.gpExecSync({ command: `echo \${GIT_EDITOR}` })
        .toString()
        .trim();
    if (gitEditor.length !== 0) {
        return gitEditor;
    }
    const editor = exec_sync_1.gpExecSync({ command: `echo \${EDITOR}` }).toString().trim();
    if (editor.length !== 0) {
        return editor;
    }
    return "nano";
}
exports.getDefaultEditor = getDefaultEditor;
//# sourceMappingURL=default_editor.js.map