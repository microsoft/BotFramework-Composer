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
/* This is a mock publishing endpoint that supports the basic features of a real remote publishing endpoint:
 *   - multiple profile can be configured to publish to this per bot
 *   - history will be maintained for each project/profile
 *   - status will initially be 202 to indicate in progress, will update after 10 seconds to 200
 */
const uuid_1 = require("uuid");
class LocalPublisher {
    constructor() {
        this.finishPublish = (botId, profileName, jobId) => __awaiter(this, void 0, void 0, function* () {
            setTimeout(() => {
                this.data[botId][profileName].forEach(element => {
                    if (element.result.id == jobId) {
                        element.status = 200;
                        element.result.message = 'Success';
                        element.result.log = element.result.log + '\nPublish succeeded!';
                    }
                });
            }, 10000);
        });
        // config include botId and version, project is content(ComposerDialogs)
        this.publish = (config, project, metadata, user) => __awaiter(this, void 0, void 0, function* () {
            const profileName = config.name;
            if (!this.data[project.id]) {
                this.data[project.id] = {};
            }
            if (!this.data[project.id][profileName]) {
                this.data[project.id][profileName] = [];
            }
            const response = {
                status: 202,
                result: {
                    time: new Date(),
                    message: 'Accepted for publishing.',
                    log: 'Publish starting...',
                    id: uuid_1.v4(),
                    comment: metadata.comment,
                },
            };
            if (metadata.comment === "500") {
                response.status = 500;
                response.result.message = 'Failed';
            }
            this.data[project.id][profileName].push(response);
            this.finishPublish(project.id, profileName, response.result.id);
            return response;
        });
        this.getStatus = (config, project, user) => __awaiter(this, void 0, void 0, function* () {
            const profileName = config.name;
            const botId = project.id;
            if (this.data[botId] && this.data[botId][profileName]) {
                const response = this.data[botId][profileName][this.data[botId][profileName].length - 1];
                // return latest status
                response.status = 500;
                return response;
            }
            else {
                return {
                    status: 404,
                    result: {
                        message: 'bot not published',
                    },
                };
            }
        });
        this.history = (config, project, user) => __awaiter(this, void 0, void 0, function* () {
            const profileName = config.name;
            const botId = project.id;
            const result = [];
            if (this.data[botId] && this.data[botId][profileName]) {
                this.data[botId][profileName].map(item => {
                    result.push(Object.assign(Object.assign({}, item.result), { status: item.status }));
                });
            }
            // return in reverse chrono
            return result.reverse();
        });
        this.rollback = (config, project, rollbackToVersion, user) => __awaiter(this, void 0, void 0, function* () {
            console.log('ROLLBACK TO', project.id, rollbackToVersion);
            const profileName = config.name;
            const botId = project.id;
            console.log('eval list', this.data[botId][profileName]);
            const matched = this.data[botId][profileName].filter(item => {
                console.log('comparing ', item.result.id, rollbackToVersion);
                return item.result.id === rollbackToVersion;
            });
            if (matched.length && matched[0].status === 200) {
                const rollback = Object.assign(Object.assign({}, matched[0]), { result: Object.assign({}, matched[0].result) });
                rollback.result.id = uuid_1.v4();
                this.data[botId][profileName].push(rollback);
                return rollback;
            }
            else {
                return {
                    status: 500,
                    result: {
                        message: 'No matching published version found in history',
                    },
                };
            }
        });
        this.data = {};
    }
}
const publisher = new LocalPublisher();
exports.default = (composer) => __awaiter(void 0, void 0, void 0, function* () {
    // pass in the custom storage class that will override the default
    yield composer.addPublishMethod(publisher);
});
//# sourceMappingURL=index.js.map