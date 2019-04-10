import { ObiTypes } from '../../transformers/constants/ObiTypes';

import {
  DefaultRenderer,
  WelcomeRule,
  IntentRule,
  Recognizer,
  BeginDialog,
  NoMatchRule,
  EventRule,
  IfCondition,
  EventGroup,
  IntentGroup,
} from './index';

const rendererByObiType = {
  [ObiTypes.WelcomeRule]: WelcomeRule,
  [ObiTypes.IntentRule]: IntentRule,
  [ObiTypes.NoMatchRule]: NoMatchRule,
  [ObiTypes.RegexRecognizer]: Recognizer,
  [ObiTypes.LuisRecognizer]: Recognizer,
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.EventRule]: EventRule,
  [ObiTypes.IfCondition]: IfCondition,
  [ObiTypes.EventGroup]: EventGroup,
  [ObiTypes.IntentGroup]: IntentGroup,
};
const DEFAULT_RENDERER = DefaultRenderer;

export function chooseRendererByType($type) {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}
