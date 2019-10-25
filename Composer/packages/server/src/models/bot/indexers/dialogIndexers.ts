import has from 'lodash.has';
import get from 'lodash.get';
import uniq from 'lodash.uniq';

import { JsonWalk, VisitorFunc } from '../../../utility/jsonWalk';
import { DialogChecker } from '../dialogChecker';
import { Path } from '../../../utility/path';

import { Dialog, FileInfo, ITrigger } from './../interface';

export class DialogIndexer {
  public dialogs: Dialog[] = [];
  private botName: string;

  constructor(botName: string) {
    this.botName = botName;
  }

  // find out all lg templates given dialog
  private ExtractLgTemplates(dialog: Dialog): string[] {
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
        const targetNames = ['prompt', 'unrecognizedPrompt', 'defaultValueResponse', 'invalidPrompt'];
        const targets: string[] = [];

        targetNames.forEach(name => {
          if (has(value, name)) {
            targets.push(get(value, name));
          }
        });

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
  private ExtractLuIntents(dialog: Dialog): string[] {
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
  private ExtractTriggers(dialog: Dialog): ITrigger[] {
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
  private ExtractReferredDialogs(dialog: Dialog): string[] {
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
  private CheckFields(dialog: Dialog): string[] {
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

  public index = (files: FileInfo[]): Dialog[] => {
    this.dialogs = [];
    if (files.length !== 0) {
      const botName = this.botName;

      for (const file of files) {
        const extName = Path.extname(file.name);
        try {
          if (extName === '.dialog' && !file.name.endsWith('.lu.dialog')) {
            const dialogJson = JSON.parse(file.content);
            const luFile = typeof dialogJson.recognizer === 'string' ? dialogJson.recognizer : '';
            const lgFile = typeof dialogJson.generator === 'string' ? dialogJson.generator : '';
            const id = Path.basename(file.name, extName);
            const isRoot = id === 'Main';
            const diagnostics = this.CheckFields(dialogJson);
            const dialog = {
              id,
              isRoot,
              displayName: isRoot ? `${botName}.Main` : id,
              content: dialogJson,
              diagnostics,
              referredDialogs: this.ExtractReferredDialogs(dialogJson),
              lgTemplates: this.ExtractLgTemplates(dialogJson),
              luIntents: this.ExtractLuIntents(dialogJson),
              luFile: Path.basename(luFile, '.lu'),
              lgFile: Path.basename(lgFile, '.lg'),
              relativePath: file.relativePath,
              triggers: this.ExtractTriggers(dialogJson),
            };

            this.dialogs.push(dialog);
          }
        } catch (e) {
          throw new Error(`parse failed at ${file.name}, ${e}`);
        }
      }
    }

    return this.dialogs;
  };

  public getDialogs = () => {
    return this.dialogs;
  };
}
