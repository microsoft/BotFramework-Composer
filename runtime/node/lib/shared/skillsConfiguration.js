"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsConfiguration = void 0;
/**
 * A helper class that loads Skills information from configuration.
 */
class SkillsConfiguration {
    constructor(settings) {
        this.skills = {};
        const { BotFrameworkSkills: skills } = settings;
        if (skills && Array.isArray(skills)) {
            for (const skill of skills) {
                const { Id: id, AppId: appId, SkillEndPoint: skillEndpoint } = skill;
                if (id && appId && skillEndpoint) {
                    const botFrameworkSkill = { id, appId, skillEndpoint };
                    this.skills[id] = botFrameworkSkill;
                }
            }
        }
        const { SkillHostEndpoint: skillHostEndpoint } = settings;
        this.skillHostEndpoint = skillHostEndpoint;
    }
}
exports.SkillsConfiguration = SkillsConfiguration;
//# sourceMappingURL=skillsConfiguration.js.map