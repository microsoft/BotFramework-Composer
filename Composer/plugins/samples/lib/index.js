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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const samplesDir = path_1.default.resolve(__dirname, '../assets/projects');
const boilerplateDir = path_1.default.resolve(__dirname, '../assets/shared');
const samplesRegitry = {
    '*': {
        tags: ["Basic"],
        support: ["C#", "JS"]
    },
    EchoBot: {
        name: 'Echo Bot',
        description: 'A bot that echoes and responds with whatever message the user entered',
        index: 1,
    },
    EmptyBot: {
        name: 'Empty Bot',
        description: 'A basic bot template that is ready for your creativity',
        index: 2,
    },
    TodoSample: {
        name: 'Simple Todo',
        description: 'A sample bot that allows you to add, list, and remove to do items.',
        index: 3,
    },
    ToDoBotWithLuisSample: {
        name: 'Todo with LUIS',
        description: 'A sample bot that allows you to add, list, and remove to do items using Language Understanding',
        index: 4,
    },
    RespondingWithCardsSample: {
        name: 'Responding with Cards',
        description: 'A sample bot that uses Language Generation to create cards.',
    },
    AskingQuestionsSample: {
        name: 'Asking Questions',
        description: 'A sample bot that shows how to ask questions and capture user input.',
    },
    InterruptionSample: {
        name: 'Interruptions',
        description: 'An advanced sample bot that shows how to handle context switching and interruption in a conversation.',
    },
    RespondingWithTextSample: {
        name: 'Responding with Text',
        description: 'A sample bot that uses Language Generation to create bot responses.',
    },
    ControllingConversationFlowSample: {
        name: 'Controlling Conversation Flow',
        description: 'A sample bot that shows how to control the flow of a conversation.',
    },
    ActionsSample: {
        name: 'Dialog Actions',
        description: 'A sample bot that shows how to use Dialog Actions.',
    },
    QnAMakerLUISSample: {
        name: 'QnA Maker and LUIS',
        description: 'A sample bot that demonstrates use of both QnA Maker & LUIS',
    },
    QnASample: {
        name: 'QnA Sample',
        description: 'A sample bot that import online QnA resource',
    }
};
function getSamples() {
    const subPaths = fs_1.default.readdirSync(samplesDir);
    const samples = [];
    for (const subPath of subPaths) {
        const fullPath = samplesDir + "/" + subPath;
        if (!fs_1.default.statSync(fullPath).isDirectory()) {
            continue;
        }
        // only looking for directories
        const dirname = subPath;
        let sample = Object.assign({ id: dirname, name: dirname, description: dirname, path: fullPath }, samplesRegitry['*']);
        if (samplesRegitry[sample.id]) {
            sample = Object.assign(Object.assign({}, sample), samplesRegitry[sample.id]);
        }
        samples.push(sample);
    }
    samples.sort((a, b) => {
        if (a.index && b.index) {
            return a.index - b.index;
        }
        if (a.index) {
            return -1;
        }
        return 1;
    });
    return samples;
}
function getBoilerplates() {
    return [
        {
            id: "boilerplate",
            name: "boilerplate",
            description: "base template for every bot template",
            path: boilerplateDir,
            tags: ["boilerplate"],
            support: ["*"],
        }
    ];
}
const samples = getSamples();
const boilerplates = getBoilerplates();
exports.default = (composer) => __awaiter(void 0, void 0, void 0, function* () {
    // register this publishing method with Composer
    for (const temlate of samples) {
        yield composer.addBotTemplate(temlate);
    }
    for (const temlate of boilerplates) {
        yield composer.addBaseTemplate(temlate);
    }
});
//# sourceMappingURL=index.js.map