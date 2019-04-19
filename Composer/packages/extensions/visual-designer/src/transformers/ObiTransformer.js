import { isRecognizer } from '../utils/obiTypeChecker';

import { consumeStrategy } from './helpers/consumerStrategy';
import { SequentialStrategy } from './strategies/SequentialStrategy';
import { GraphicalStrategy } from './strategies/GraphicalStrategy';
import { RootDialogStrategy } from './strategies/RootDialogStrategy';

class ObiTransformer {
  /**
   * There are three elements in OBI json we care about: 'recognizer', 'rules' and 'steps'.
   * Considering the fact that OBI json is authored step by step, we should follow two principles:
   * 1. always make the transformer work under any conditions, even some elements are missing.
   * 2. always show every element in graph, let users decide what to do next.
   *
   * Below is the truth table of how we handle different conditions:
   * (1 indicates the input json 'contains the given element', 0 indicates 'not contains')
   *
   * | recognizer | rules | steps | strategy
   * --------------------------------------------------------------------------------------
   * |     1      |   1   |   1   | RootDialog  (group intents together)
   * |     1      |   1   |   0   | RootDialog  (group intents together)
   * |     1      |   0   |   1   | Sequential  ('steps' as a sequence, isolate 'recognizer')
   * |     1      |   0   |   0   | Graphical   (draw isolated 'recognizer')
   * |     0      |   1   |   1   | Sequential  ('steps' as a sequence, draw 'rules' as an isolated group)
   * |     0      |   1   |   0   | Sequential  ( 'rules' as a group, only chunk them)
   * |     0      |   0   |   1   | Sequential  ('steps' as a sequence)
   * |     0      |   0   |   0   | Sequential  (draw nothing, fallback to Sequential)
   *
   *
   * About Graphical and Sequential strategy:
   * [RootDialog]
   *            Recognizer
   *                |
   *            |Events(n)|
   *                |
   *            |Intents(n)|
   *
   * [Graphical]
   *            Decision?
   *           /    |    \
   *        Choice Choice Choice
   *
   * [Sequential]
   *            Step1
   *              |
   *            Step2
   *              |
   *            Step3
   *
   */
  chooseStrategy(input) {
    if (!input) return null;

    const { recognizer, rules, steps } = input;
    let flag = '';
    flag += isRecognizer(recognizer) ? '1' : '0';
    flag += Array.isArray(rules) && rules.length ? '1' : '0';
    flag += Array.isArray(steps) && steps.length ? '1' : '0';

    switch (flag) {
      case '100':
        return GraphicalStrategy;
      case '111':
      case '110':
        return RootDialogStrategy;
      default:
        return SequentialStrategy;
    }
  }

  toGraphSchema(input) {
    const chosenStrategy = this.chooseStrategy(input);

    if (chosenStrategy) {
      return consumeStrategy(input, chosenStrategy);
    }
    return [];
  }
}

export const obiTransformer = new ObiTransformer();
