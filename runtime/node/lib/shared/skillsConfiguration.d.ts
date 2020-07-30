import { BotFrameworkSkill } from 'botbuilder';
import { BotSettings } from './settings';
/**
 * A helper class that loads Skills information from configuration.
 */
export declare class SkillsConfiguration {
    constructor(settings: Partial<BotSettings>);
    skills: {
        [key: string]: BotFrameworkSkill;
    };
    skillHostEndpoint: string;
}
