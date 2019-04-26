/* eslint-disable @typescript-eslint/no-empty-interface */

interface BaseSchema {
  /** Defines the valid properties for the component you are configuring (from a dialog .schema file) */
  $type: string;
  /** Inline id for reuse of an inline definition */
  $id?: string;
  /** Copy the definition by id from a .dialog file. */
  $copy?: string;
  /** Extra information for the Bot Framework Designer. */
  $designer?: OpenObject;
}

/* Union of components which implement the IDialog interface */
interface MicrosoftIDialog extends BaseSchema {}

/* Union of components which implement the IActivityTemplate interface */
type MicrosoftIActivityTemplate = string;

interface IBaseDialog extends BaseSchema {
  /** This is that will be passed in as InputProperty and also set as the OutputProperty */
  property?: string;
  /** This defines properties which be passed as arguments to this dialog */
  inputProperties?: { [XPathEvaluator: string]: string };
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

type MicrosoftIRecognizer = LuisRecognizer | RegexRecognizer;
