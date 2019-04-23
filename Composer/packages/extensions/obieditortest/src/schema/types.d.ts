/* eslint-disable @typescript-eslint/no-empty-interface */

/* Union of components which implement the IDialog interface */
interface MicrosoftIDialog {}

/* Union of components which implement the IActivityTemplate interface */
type MicrosoftIActivityTemplate = string;

interface IBaseDialog {
  /** This is that will be passed in as InputProperty and also set as the OutputProperty */
  property?: string;
  /** This defines properties which be passed as arguments to this dialog */
  inputProperties?: { [XPathEvaluator: string]: string };
  /** This is the property which the EndDialog(result) will be set to when EndDialog() is called */
  outputProperty?: string;
}

enum ListStyle {
  None = 'None',
  Auto = 'Auto',
  Inline = 'Inline',
  List = 'List',
  SuggestedAction = 'SuggestedAction',
  HeroCard = 'HeroCard',
}

interface OpenObject {
  [x: string]: string;
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

/*
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
