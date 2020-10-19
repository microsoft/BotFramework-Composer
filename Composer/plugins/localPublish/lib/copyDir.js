"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyDir = void 0;
/**
 * Copy a dir from one storage to another storage
 * @param srcDir path of the src dir
 * @param srcStorage src storage
 * @param dstDir path of the dst dir
 * @param dstStorage dst storage
 */
function copyDir(srcDir, srcStorage, dstDir, dstStorage) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield srcStorage.exists(srcDir)) || !(yield srcStorage.stat(srcDir)).isDir) {
            throw new Error(`No such dir ${srcDir}}`);
        }
        if (!(yield dstStorage.exists(dstDir))) {
            yield dstStorage.mkDir(dstDir, { recursive: true });
        }
        const paths = yield srcStorage.readDir(srcDir);
        for (const path of paths) {
            const srcPath = `${srcDir}/${path}`;
            const dstPath = `${dstDir}/${path}`;
            if ((yield srcStorage.stat(srcPath)).isFile) {
                // copy files
                const content = yield srcStorage.readFile(srcPath);
                yield dstStorage.writeFile(dstPath, content);
            }
            else {
                // recursively copy dirs
                yield copyDir(srcPath, srcStorage, dstPath, dstStorage);
            }
        }
    });
}
exports.copyDir = copyDir;
//# sourceMappingURL=copyDir.js.map