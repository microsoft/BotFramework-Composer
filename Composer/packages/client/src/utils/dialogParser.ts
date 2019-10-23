import has from 'lodash.has';
import uniq from 'lodash.uniq';
import trimend from 'lodash.trimend';
import { ITrigger, MicrosoftAdaptiveDialog } from 'shared';

import { DialogChecker } from './dialogChecker';
import { JsonWalk, VisitorFunc } from './jsonWalk';

export class DialogParser {
  // find out all lg templates given dialog
  private ExtractLgTemplates(dialog: MicrosoftAdaptiveDialog): string[] {
    const templates: string[] = [];

    /**
     *
     * @param path , jsonPath string
     * @param value , current node value
     *
     * @return boolean, true to stop walk
     */
    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      // it's a valid schema dialog node.
      if (has(value, '$type')) {
        const targets: string[] = [];
        // look for prompt field
        if (has(value, 'prompt')) {
          targets.push(value.prompt);
        }
        // look for unrecognizedPrompt field
        if (has(value, 'unrecognizedPrompt')) {
          targets.push(value.unrecognizedPrompt);
        }
        // look for other $type
        switch (value.$type) {
          case 'Microsoft.SendActivity':
            targets.push(value.activity);
            break;
          // if we want stop at some $type, do here
          case 'location':
            return true;
        }

        targets.forEach(target => {
          // match a template name
          // match a temlate func  e.g. `showDate()`
          // eslint-disable-next-line security/detect-unsafe-regex
          const reg = /\[([A-Za-z_][-\w]+)(\(.*\))?\]/g;
          let matchResult;
          while ((matchResult = reg.exec(target)) !== null) {
            const templateName = matchResult[1];
            templates.push(templateName);
          }
        });
      }
      return false;
    };

    JsonWalk('$', dialog, visitor);

    return uniq(templates);
  }

  // find out all lu intents given dialog
  private ExtractLuIntents(dialog: MicrosoftAdaptiveDialog): string[] {
    const intents: string[] = [];

    /**
     *
     * @param path , jsonPath string
     * @param value , current node value
     *
     * @return boolean, true to stop walk
     */
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

  // find out all triggers given dialog
  private ExtractTriggers(dialog: MicrosoftAdaptiveDialog): ITrigger[] {
    const trigers: ITrigger[] = [];

    /**
     *
     * @param path , jsonPath string
     * @param value , current node value
     *
     * @return boolean, true to stop walk
     */
    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      // it's a valid schema dialog node.
      if (has(value, 'triggers') && Array.isArray(value.triggers)) {
        value.triggers.forEach((rule: any, index: number) => {
          // make sure event is actualy an event type, not OnDialogEvent.events array
          if (rule && typeof rule === 'object' && rule.$type) {
            const trigger: ITrigger = {
              id: `triggers[${index}]`,
              displayName: '',
              type: rule.$type,
              isIntent: rule.$type === 'Microsoft.OnIntent',
            };

            if (has(rule, '$designer.name')) {
              trigger.displayName = rule.$designer.name;
            } else if (trigger.isIntent && has(rule, 'intent')) {
              trigger.displayName = rule.intent;
            }

            trigers.push(trigger);
          }
        });
        return true;
      }
      return false;
    };

    JsonWalk('$', dialog, visitor);

    return trigers;
  }

  // find out all referred dialog
  private ExtractReferredDialogs(dialog: MicrosoftAdaptiveDialog): string[] {
    const dialogs: string[] = [];

    /**
     *
     * @param path , jsonPath string
     * @param value , current node value
     *
     * @return boolean, true to stop walk
     */
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

  // check all fields
  private CheckFields(dialog: MicrosoftAdaptiveDialog): string[] {
    const errors: string[] = [];
    /**
     *
     * @param path , jsonPath string
     * @param value , current node value
     *
     * @return boolean, true to stop walk
     */
    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      // it's a valid schema dialog node.
      if (has(value, '$type') && has(DialogChecker, value.$type)) {
        const matchedCheckers = DialogChecker[value.$type];
        matchedCheckers.forEach(checker => {
          const checkRes = checker.apply(null, [
            {
              path,
              value,
            },
          ]);
          if (checkRes) {
            Array.isArray(checkRes) ? errors.push(...checkRes) : errors.push(checkRes);
          }
        });
      }
      return false;
    };

    JsonWalk('$', dialog, visitor);
    return errors;
  }

  public parse = content => {
    const luFile = typeof content.recognizer === 'string' ? content.recognizer : '';
    const lgFile = typeof content.generator === 'string' ? content.generator : '';
    return {
      content,
      diagnostics: this.CheckFields(content),
      referredDialogs: this.ExtractReferredDialogs(content),
      lgTemplates: this.ExtractLgTemplates(content),
      luIntents: this.ExtractLuIntents(content),
      luFile: trimend(luFile, '.lu'),
      lgFile: trimend(lgFile, '.lg'),
      triggers: this.ExtractTriggers(content),
    };
  };

  public parseAll = dialogs => {
    return dialogs.map(dialog => {
      return { ...dialog, ...this.parse(dialog.content) };
    });
  };
}

const dialogPaser = new DialogParser();
export default dialogPaser;
