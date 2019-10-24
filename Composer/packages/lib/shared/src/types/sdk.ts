/* eslint-disable @typescript-eslint/no-empty-interface */

interface BaseSchema {
  /** Defines the valid properties for the component you are configuring (from a dialog .schema file) */
  $type: string;
  /** Inline id for reuse of an inline definition */
  $id?: string;
  /** Copy the definition by id from a .dialog file. */
  $copy?: string;
  /** Extra information for the Bot Framework Composer. */
  $designer?: OpenObject;
}

/* Union of components which implement the IActivityTemplate interface */
type MicrosoftIActivityTemplate = string;

type MicrosoftIExpression = string;

interface OpenObject<T = string> {
  [x: string]: T;
}

export interface IChoice {
  /** the value to return when selected. */
  value?: string;
  /** Card action for the choice */
  action?: OpenObject;
  /** the list of synonyms to recognize in addition to the value. This is optional. */
  synonyms?: string[];
}

type IListStyle = 'None' | 'Auto' | 'Inline' | 'List' | 'SuggestedAction' | 'HeroCard';

export interface IChoiceOption {
  /** Character used to separate individual choices when there are more than 2 choices */
  inlineSeparator?: string;
  /** Separator inserted between the choices when their are only 2 choices */
  inlineOr?: string;
  /** Separator inserted between the last 2 choices when their are more than 2 choices. */
  inlineOrMore?: string;
  /** If true, inline and list style choices will be prefixed with the index of the choice. */
  includeNumbers?: boolean;
}

export interface IConfirmChoice {
  /** the value to return when selected. */
  value?: string;
  /** Card action for the choice */
  action?: OpenObject;
  /** The list of synonyms to recognize in addition to the value. This is optional. */
  synonyms?: string[];
}

export interface IRecognizerOption {
  /** If true, the choices value field will NOT be search over */
  noValue?: boolean;
}

/**
 * Inputs
 */

export interface InputDialog extends BaseSchema {
  /** (Optional) id for the dialog */
  id: string;
  /** The message to send to as prompt for this input. */
  prompt: MicrosoftIActivityTemplate;
  /** The message to send if the last input is not recognized. */
  unrecognizedPrompt: MicrosoftIActivityTemplate;
  /** The message to send to when then input was not valid for the input type. */
  invalidPrompt: MicrosoftIActivityTemplate;
  /** The message to send to when max turn count has been exceeded and the default value is selected as the value. */
  defaultValueResponse: MicrosoftIActivityTemplate;
  /** The max retry count for this prompt. */
  maxTurnCount: number;
  /** Expressions to validate an input. */
  validations: MicrosoftIExpression[];
  /** Property that this input dialog is bound to */
  property: MicrosoftIExpression;
  /** Value to return if the value expression can't be evaluated. */
  defaultValue: MicrosoftIExpression;
  /** If set to true this will always prompt the user regardless if you already have the value or not. */
  alwaysPrompt: boolean;
  /** Always will always consult parent dialogs first, never will not consult parent dialogs, notRecognized will consult parent only when it's not recognized */
  allowInterruptions: 'always' | 'never' | 'notRecognized';
}

/** This represents a dialog which gathers an attachment such as image or music */
export interface AttachmentInput extends Partial<InputDialog> {
  /** The attachment output format. */
  outputFormat?: 'all' | 'first';
}

/** This represents a dialog which gathers a choice responses */
export interface ChoiceInput extends Partial<InputDialog> {
  /** The output format. */
  outputFormat?: 'value' | 'index';
  choices?: IChoice[];
  /** Compose an output activity containing a set of choices */
  appendChoices?: boolean;
  /** The prompts default locale that should be recognized. */
  defaultLocale?: string;
  /** The kind of choice list style to generate */
  style?: IListStyle;
  choiceOptions?: IChoiceOption;
  recognizerOptions?: IRecognizerOption;
}

/** This represents a dialog which gathers a yes/no style responses */
export interface ConfirmInput extends Partial<InputDialog> {
  outputFormat: undefined;
  /** The prompts default locale that should be recognized. */
  defaultLocale?: string;
  /** The kind of choice list style to generate */
  style?: IListStyle;
  choiceOptions?: IChoiceOption;
  confirmChoices?: IConfirmChoice[];
}

export interface DateTimeInput extends Partial<InputDialog> {
  outputFormat: undefined;
  /** The prompts default locale that should be recognized. */
  defaultLocale?: string;
}
export interface NumberInput extends Partial<InputDialog> {
  /** The output format. */
  outputFormat?: 'float' | 'integer';
  /** The prompts default locale that should be recognized. */
  defaultLocale?: string;
}

/** This represents a dialog which gathers a text from the user */
export interface TextInput extends Partial<InputDialog> {
  /** The output format. */
  outputFormat?: 'none' | 'trim' | 'lowercase' | 'uppercase';
}

export type MicrosoftInputDialog =
  | AttachmentInput
  | ChoiceInput
  | ConfirmInput
  | DateTimeInput
  | NumberInput
  | TextInput;

/**
 * Recognizers
 */

export interface LuisRecognizer extends BaseSchema {
  applicationId: string;
  endpoint: string;
  endpointKey: string;
}

interface IntentPattern {
  $type: 'Microsoft.IntentPattern';
  intent: string;
  pattern: string;
}

export interface RegexRecognizer extends BaseSchema {
  /** Pattern->Intents mappings */
  intents: IntentPattern[];
}

export type MicrosoftIRecognizer = LuisRecognizer | RegexRecognizer | string;

/**
 * Rules
 */

export enum DialogEvent {
  beginDialog = 'beginDialog',
  consultDialog = 'consultDialog',
  cancelDialog = 'cancelDialog',
  activityReceived = 'activityReceived',
  recognizedIntent = 'recognizedIntent',
  unknownIntent = 'unknownIntent',
  stepsStarted = 'stepsStarted',
  stepsSaved = 'stepsSaved',
  stepsEnded = 'stepsEnded',
  stepsResumed = 'stepsResumed',
}

interface RuleBase extends BaseSchema {
  /** Optional constraint to which must be met for this rule to fire */
  constraint?: string;
  /** Sequence of steps or dialogs to execute */
  actions: MicrosoftIDialog[];
}

/** This defines the steps to take when an Intent is recognized (and optionally entities) */
export interface OnIntent extends RuleBase {
  /** Intent name to trigger on */
  intent: string;
  /** The entities required to trigger this rule */
  entities: string[];
}

/** Defines a sequence of steps to take if there is no other trigger or plan operating */
export interface OnUnknownIntent extends RuleBase {}

export type ITriggerCondition = OnIntent | OnUnknownIntent;

/**
 * Conversational Flow and Dialog Management
 */

export interface CaseCondition {
  /** Value which must match the condition property */
  value: string;
  /** Steps to execute if case is equal to condition */
  actions: MicrosoftIDialog[];
}

/** Step which conditionally decides which step to execute next. */
export interface SwitchCondition extends BaseSchema {
  /** Expression to evaluate to switch on. */
  condition?: string;
  /** Cases to evaluate against condition */
  cases?: CaseCondition[];
  /** Step to execute if no case is equal to condition */
  default?: MicrosoftIDialog[];
}

/** Flexible, data driven dialog that can adapt to the conversation. */
export interface MicrosoftAdaptiveDialog extends BaseSchema {
  /** Optional dialog ID. */
  id?: string;
  /** If this is true the dialog will automatically end when there are no more steps to run.  If this is false it is the responsbility of the author to call EndDialog at an appropriate time. */
  autoEndDialog?: boolean;
  /** Value that will be passed back to the parent dialog. */
  defaultResultProperty?: string;
  /** Configured recognizer to generate intent and entites from user utterance. */
  recognizer?: MicrosoftIRecognizer;
  /** This is the array of rules to use to evaluate conversation */
  triggers: ITriggerCondition[];
}

/* Union of components which implement the IDialog interface */
export type MicrosoftIDialog =
  | ChoiceInput
  | ConfirmInput
  | MicrosoftIRecognizer
  | ITriggerCondition
  | SwitchCondition
  | TextInput;
