"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const path_1 = __importDefault(require("path"));
const format_message_1 = __importDefault(require("format-message"));
exports.default = (composer) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.VA_CREATION) {
        // register the base template which will appear in the new bot modal
        composer.addBotTemplate({
            id: 'va-core',
            name: format_message_1.default('VA Core'),
            description: format_message_1.default('The core of your new VA - ready to run, just add skills!'),
            path: path_1.default.resolve(__dirname, '../template'),
        });
    }
});
//# sourceMappingURL=index.js.map