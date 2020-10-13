// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type DesignerData = {
  name?: string;
  description?: string;
  id: string;
};

export type BaseSchema = {
  /** Defines the valid properties for the component you are configuring (from a dialog .schema file) */
  $kind: string;
  /** Inline id for reuse of an inline definition */
  $id?: string;
  /** Copy the definition by id from a .dialog file. */
  $copy?: string;
  /** Extra information for the Bot Framework Composer. */
  $designer?: DesignerData;
  /** If 'disabled' equals to or be evaluated as 'true', runtime will skip this action. */
  disabled?: boolean | string;
};

/* Union of components which implement the IActivityTemplate interface */
type MicrosoftIActivityTemplate = string;

type MicrosoftIExpression = string;

interface OpenObject<T = string> {
  [x: string]: T;
}

export type IAssignmentObject = {
  value?: string;
  property?: string;
};

export type IChoiceObject = {
  /** the value to return when selected. */
  value?: string;
  /** Card action for the choice */
  action?: OpenObject;
  /** the list of synonyms to recognize in addition to the value. This is optional. */
  synonyms?: string[];
};

export type IChoice = IChoiceObject[] | string;

type IListStyle = 'none' | 'auto' | 'inline' | 'list' | 'suggestedAction' | 'heroCard';

export type IChoiceOption = {
  /** Character used to separate individual choices when there are more than 2 choices */
  inlineSeparator?: string;
  /** Separator inserted between the choices when their are only 2 choices */
  inlineOr?: string;
  /** Separator inserted between the last 2 choices when their are more than 2 choices. */
  inlineOrMore?: string;
  /** If true, inline and list style choices will be prefixed with the index of the choice. */
  includeNumbers?: boolean;
};

export type IConfirmChoice = {
  /** the value to return when selected. */
  value?: string;
  /** Card action for the choice */
  action?: OpenObject;
  /** The list of synonyms to recognize in addition to the value. This is optional. */
  synonyms?: string[];
};

export type IRecognizerOption = {
  /** If true, the choices value field will NOT be search over */
  noValue?: boolean;
};

/** Respond with an activity. */
export type SendActivity = BaseSchema & {
  activity?: MicrosoftIActivityTemplate;
};

/**
 * Inputs
 */

export type InputDialog = BaseSchema & {
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
  /** Gets or sets a value expression which can be used to intialize the input prompt. */
  value: MicrosoftIExpression;
  /** Value to return if the value expression can't be evaluated. */
  defaultValue: MicrosoftIExpression;
  /** If set to true this will always prompt the user regardless if you already have the value or not. */
  alwaysPrompt: boolean;
  /** Always will always consult parent dialogs first, never will not consult parent dialogs, notRecognized will consult parent only when it's not recognized */
  allowInterruptions: 'always' | 'never' | 'notRecognized';
};

/** This represents a dialog which gathers an attachment such as image or music */
export type AttachmentInput = Partial<InputDialog> & {
  /** The attachment output format. */
  outputFormat?: 'all' | 'first';
};

/** This represents a dialog which gathers a choice responses */
export type ChoiceInput = Partial<InputDialog> & {
  /** The output format. */
  outputFormat?: 'value' | 'index';
  choices?: IChoice;
  /** Compose an output activity containing a set of choices */
  appendChoices?: boolean;
  /** The prompts default locale that should be recognized. */
  defaultLocale?: string;
  /** The kind of choice list style to generate */
  style?: IListStyle;
  choiceOptions?: IChoiceOption;
  recognizerOptions?: IRecognizerOption;
};

/** This represents a dialog which gathers a yes/no style responses */
export type ConfirmInput = Partial<InputDialog> & {
  outputFormat: undefined;
  /** The prompts default locale that should be recognized. */
  defaultLocale?: string;
  /** The kind of choice list style to generate */
  style?: IListStyle;
  choiceOptions?: IChoiceOption;
  confirmChoices?: IConfirmChoice[];
};

export type DateTimeInput = Partial<InputDialog> & {
  outputFormat: undefined;
  /** The prompts default locale that should be recognized. */
  defaultLocale?: string;
};
export type NumberInput = Partial<InputDialog> & {
  /** The output format. */
  outputFormat?: 'float' | 'integer';
  /** The prompts default locale that should be recognized. */
  defaultLocale?: string;
};

/** This represents a dialog which gathers a text from the user */
export type TextInput = Partial<InputDialog> & {
  /** The output format. */
  outputFormat?: 'none' | 'trim' | 'lowercase' | 'uppercase';
};

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

export type LuisRecognizer = BaseSchema & {
  applicationId: string;
  endpoint: string;
  endpointKey: string;
};

interface IntentPattern {
  $kind: 'Microsoft.IntentPattern';
  intent: string;
  pattern: string;
}

export type RegexRecognizer = BaseSchema & {
  /** Pattern->Intents mappings */
  intents: IntentPattern[];
};

export type CrossTrainedRecognizer = BaseSchema & {
  /** Pattern->Intents mappings */
  recognizers: string[];
};

export type MicrosoftIRecognizer = LuisRecognizer | RegexRecognizer | CrossTrainedRecognizer | string;

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

type RuleBase = BaseSchema & {
  /** Optional constraint to which must be met for this rule to fire */
  constraint?: string;
  /** Sequence of steps or dialogs to execute */
  actions: MicrosoftIDialog[];
};

/** This defines the steps to take when an Intent is recognized (and optionally entities) */
export type OnIntent = RuleBase & {
  /** Intent name to trigger on */
  intent: string;
  /** The entities required to trigger this rule */
  entities: string[];
};

/** Defines a sequence of steps to take if there is no other trigger or plan operating */
export type OnUnknownIntent = RuleBase & {};

export type ITriggerCondition = OnIntent | OnUnknownIntent;

/**
 * Conversational Flow and Dialog Management
 */

export type CaseCondition = {
  /** Value which must match the condition property */
  value: string;
  /** Steps to execute if case is equal to condition */
  actions: MicrosoftIDialog[];
};

/** Step which conditionally decides which step to execute next. */
export type SwitchCondition = BaseSchema & {
  /** Expression to evaluate to switch on. */
  condition?: string;
  /** Cases to evaluate against condition */
  cases?: CaseCondition[];
  /** Step to execute if no case is equal to condition */
  default?: MicrosoftIDialog[];
};

/** Two-way branch the conversation flow based on a condition. */
export type IfCondition = BaseSchema & {
  /** Expression to evaluate. */
  condition?: string;
  actions?: MicrosoftIDialog[];
  elseActions?: MicrosoftIDialog[];
};

/** Execute actions on each item in an a collection. */
export type Foreach = BaseSchema & {
  itemsProperty?: string;
  actions?: MicrosoftIDialog[];
};

/** Execute actions on each page (collection of items) in an array. */
export type ForeachPage = BaseSchema & {
  itemsProperty?: string;
  pageSize?: number;
  actions?: MicrosoftIDialog[];
};

export type EditActions = BaseSchema & {
  changeType: string;
  actions?: MicrosoftIDialog[];
};

/** Flexible, data driven dialog that can adapt to the conversation. */
export type MicrosoftAdaptiveDialog = BaseSchema & {
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
};

/* Union of components which implement the IDialog interface */
export type MicrosoftIDialog =
  | ChoiceInput
  | ConfirmInput
  | MicrosoftIRecognizer
  | ITriggerCondition
  | SwitchCondition
  | TextInput
  | SendActivity
  | IfCondition
  | Foreach
  | ForeachPage;
