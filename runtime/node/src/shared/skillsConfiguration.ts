// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BotFrameworkSkill } from 'botbuilder';
import { BotSettings } from './settings';

/**
 * A helper class that loads Skills information from configuration.
 */
export class SkillsConfiguration {
    public constructor(settings: Partial<BotSettings>) {
        const { BotFrameworkSkills: skills } = settings;
        if (skills && Array.isArray(skills)) {
            for (const skill of skills) {
                const { Id: id, AppId: appId, SkillEndPoint: skillEndpoint } = skill;
                if (id && appId && skillEndpoint) {
                    const botFrameworkSkill: BotFrameworkSkill = { id, appId, skillEndpoint };
                    this.skills[id] = botFrameworkSkill;
                }
            }
        }

        const { SkillHostEndpoint: skillHostEndpoint } = settings;
        this.skillHostEndpoint = skillHostEndpoint;
    }

    public skills: { [key: string]: BotFrameworkSkill } = {};

    public skillHostEndpoint: string;
}
