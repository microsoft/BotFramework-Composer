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

interface IBaseDialog extends BaseSchema {
  /** This is that will be passed in as InputProperty and also set as the OutputProperty */
  property?: string;
  /** This defines properties which be passed as arguments to this dialog */
  inputProperties?: { [x: string]: string };
  /** This is the property which the EndDialog(result) will be set to when EndDialog() is called */
  outputProperty?: string;
}

declare enum ListStyle {
  None = 'None',
  Auto = 'Auto',
  Inline = 'Inline',
  List = 'List',
  SuggestedAction = 'SuggestedAction',
  HeroCard = 'HeroCard',
}

interface OpenObject<T = string> {
  [x: string]: T;
}
type CardAction = OpenObject;

interface IChoice {
  /** the value to return when selected. */
  value?: string;
  /** Card action for the choice */
  action?: OpenObject;
  /** the list of synonyms to recognize in addition to the value. This is optional. */
  synonyms?: string[];
}

/**
 * Steps
 */

/** This represents a dialog which gathers a choice responses */
interface ChoiceInput extends IBaseDialog {
  /** The message to send to as prompt for this input. */
  prompt?: MicrosoftIActivityTemplate;
  /** The message to send to prompt again. */
  retryPrompt?: MicrosoftIActivityTemplate;
  /** The message to send to when then input was not recognized or not valid for the input type. */
  invalidPrompt?: MicrosoftIActivityTemplate;
  /** The kind of choice list style to generate */
  style?: ListStyle;

  choicesProperty?: string;

  choices?: IChoice[];
}

/** A dialog step that executes custom code */
interface CodeStep extends IBaseDialog {
  codeHandler: string;
}

/** This represents a dialog which gathers a yes/no style responses */
interface ConfirmInput extends IBaseDialog {
  /** The message to send to as prompt for this input. */
  prompt?: MicrosoftIActivityTemplate;
  /** The message to send to prompt again. */
  retryPrompt?: MicrosoftIActivityTemplate;
  /** The message to send to when then input was not recognized or not valid for the input type. */
  invalidPrompt?: MicrosoftIActivityTemplate;
}

/** This represents a dialog which gathers a text from the user */
interface TextInput extends IBaseDialog {
  /** The message to send to as prompt for this input. */
  prompt?: MicrosoftIActivityTemplate;
  /** The message to send to prompt again. */
  retryPrompt?: MicrosoftIActivityTemplate;
  /** The message to send to when then input was not recognized or not valid for the input type. */
  invalidPrompt?: MicrosoftIActivityTemplate;
  /** A regular expression pattern which must match */
  pattern?: string;
}

/**
 * Recognizers
 */

interface LuisRecognizer extends BaseSchema {
  applicationId: string;
  endpoint: string;
  endpointKey: string;
}

interface RegexRecognizer extends BaseSchema {
  /** Pattern->Intents mappings */
  intents: OpenObject;
}

type MicrosoftIRecognizer = LuisRecognizer | RegexRecognizer | string;

/**
 * Rules
 */

declare enum DialogEvent {
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
  steps: MicrosoftIDialog[];
}

/** Defines a rule for an event which is triggered by some source */
interface EventRule extends RuleBase {
  /** Events to trigger this rule for */
  events: DialogEvent[];
}

/** This defines the steps to take when an Intent is recognized (and optionally entities) */
interface IntentRule extends RuleBase {
  /** Intent name to trigger on */
  intent: string;
  /** The entities required to trigger this rule */
  entities: string[];
}

/** Defines a rule for an event which is triggered by some source */
interface Rule extends RuleBase {}

/** Defines a sequence of steps to take if there is no other trigger or plan operating */
interface UnknownIntentRule extends RuleBase {}

type MicrosoftIRule = EventRule | IntentRule | Rule | UnknownIntentRule;

/**
 * Conversational Flow and Dialog Management
 */

interface CaseCondition {
  /** Value which must match the condition property */
  value: string;
  /** Steps to execute if case is equal to condition */
  steps: MicrosoftIDialog[];
}

/** Step which conditionally decides which step to execute next. */
interface SwitchCondition extends BaseSchema {
  /** Expression to evaluate to switch on. */
  condition?: string;
  /** Cases to evaluate against condition */
  cases?: CaseCondition[];
  /** Step to execute if no case is equal to condition */
  default?: MicrosoftIDialog[];
}

/** This configures a data driven dialog via a collection of steps/dialogs. */
interface MicrosoftAdaptiveDialog extends BaseSchema {
  /** If this is true the dialog will automatically end when there are no more steps to run.  If this is false it is the responsbility of the author to call EndDialog at an appropriate time. */
  autoEndDialog?: boolean;
  /** Configured recognizer to generate intent and entites from user utterance. */
  recognizer?: MicrosoftIRecognizer;
  /** Language generator to use for this dialog. (aka: LG file) */
  generator?: string;
  /** This is the initial sequence of steps to execute when this dialog is started. */
  steps: MicrosoftIDialog[];
  /** This is the array of rules to use to evaluate conversation */
  rules: MicrosoftIRule[];
}

/* Union of components which implement the IDialog interface */
type MicrosoftIDialog =
  | ChoiceInput
  | ConfirmInput
  | MicrosoftIRecognizer
  | MicrosoftIRule
  | SwitchCondition
  | TextInput;
