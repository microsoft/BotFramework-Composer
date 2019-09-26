import { has, uniq } from 'lodash';

import { Diagnostic } from '../validator';
import { JsonWalk, VisitorFunc } from '../../utility/jsonWalk';
import { ITrigger } from '../bot/interface';

import { ResourceType } from './resource';
import { FileResource } from './fileResource';

export class DialogResource implements FileResource {
  // Resource
  public id: string;
  public content: any;
  public type: ResourceType;
  public diagnostics: Diagnostic[] = [];

  // FileResource
  public relativePath: string;

  // DialogResource
  public isRoot: boolean = false;
  public displayName: string = '';
  public triggers: ITrigger[] = [];

  // references
  public referredDialogs: string[] = [];
  public referredLGFile: string = '';
  public referredLUFile: string = '';

  public referredLUIntents: string[] = [];
  public referredLGTemplates: string[] = [];

  constructor(id: string, content: string, relativePath: string) {
    this.id = id;
    this.content = content;
    this.type = ResourceType.DIALOG;
    this.relativePath = relativePath;
  }

  public index = async (botName: string) => {
    // TODO: clarify content vs parsedContent
    this.content = JSON.parse(this.content);

    this.isRoot = this.id === 'Main';
    this.displayName = this.isRoot ? botName + '.Main' : this.id;

    this.referredLUFile = typeof this.content.recognizer === 'string' ? this.content.recognizer : '';
    this.referredLGFile = typeof this.content.generator === 'string' ? this.content.generator : '';
    this.referredDialogs = this.ExtractReferredDialogs(this.content);
    this.referredLGTemplates = this.ExtractLgTemplates(this.content);
    this.referredLUIntents = this.ExtractLuIntents(this.content);

    this.triggers = this.ExtractTriggers(this.content);
  };

  private ExtractReferredDialogs(dialog: any): string[] {
    const dialogs: string[] = [];

    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      // it's a valid schema dialog node.
      if (has(value, '$type') && value.$type === 'Microsoft.BeginDialog') {
        const dialogName = value.dialog;
        dialogs.push(dialogName);
      }
      return false;
    };

    JsonWalk('$', dialog, visitor);

    return uniq(dialogs);
  }

  private ExtractLgTemplates(dialog: any): string[] {
    const templates: string[] = [];

    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      // it's a valid schema dialog node.
      if (has(value, '$type')) {
        let target;
        switch (value.$type) {
          case 'Microsoft.SendActivity':
            target = value.activity;
            break;
          case 'Microsoft.TextInput':
            target = value.prompt;
            break;

          // if we want stop at some $type, do here
          case 'location':
            return true;
        }

        if (target && typeof target === 'string') {
          // match a template name
          // match a temlate func  e.g. `showDate()`
          const reg = /\[([A-Za-z_][-\w]+)(\(.*\))?\]/g;
          let matchResult;
          while ((matchResult = reg.exec(target)) !== null) {
            const templateName = matchResult[1];
            templates.push(templateName);
          }
        }
      }
      return false;
    };

    JsonWalk('$', dialog, visitor);

    return uniq(templates);
  }

  private ExtractLuIntents(dialog: any): string[] {
    const intents: string[] = [];

    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      // it's a valid schema dialog node.
      if (has(value, '$type') && value.$type === 'Microsoft.OnIntent') {
        const intentName = value.intent;
        intents.push(intentName);
      }
      return false;
    };

    JsonWalk('$', dialog, visitor);

    return uniq(intents);
  }

  private ExtractTriggers(dialog: any): ITrigger[] {
    const trigers: ITrigger[] = [];

    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      // it's a valid schema dialog node.
      if (has(value, 'events')) {
        value.events.forEach((rule: any, index: number) => {
          const trigger: ITrigger = {
            id: `events[${index}]`,
            displayName: '',
            type: rule.$type,
            isIntent: rule.$type === 'Microsoft.OnIntent',
          };

          if (has(rule, '$designer.name')) {
            trigger.displayName = rule.$designer.name;
          } else if (trigger.isIntent && has(rule, 'intent')) {
            trigger.displayName = rule.intent;
          }

          if (trigger.isIntent && trigger.displayName) {
            trigger.displayName = '#' + trigger.displayName;
          }
          trigers.push(trigger);
        });
      }
      return false;
    };

    JsonWalk('$', dialog, visitor);

    return trigers;
  }
}
