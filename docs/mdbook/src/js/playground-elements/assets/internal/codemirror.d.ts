/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import '../_codemirror/codemirror-bundle.js';
import CodeMirrorCore from 'codemirror';
import CoreMirrorFolding from 'codemirror/addon/fold/foldcode.js';
import CodeMirrorHinting from 'codemirror/addon/hint/show-hint.js';
import CodeMirrorComment from 'codemirror/addon/comment/comment.js';
/**
 * CodeMirror function.
 *
 * This function is defined as window.CodeMirror, but @types/codemirror doesn't
 * declare that.
 */
export declare const CodeMirror: typeof CodeMirrorCore & typeof CoreMirrorFolding & typeof CodeMirrorHinting & typeof CodeMirrorComment;
//# sourceMappingURL=codemirror.d.ts.map