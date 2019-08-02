import { Store, ActionHandlers } from '../types';

type BoundAction = (...args: any[]) => void;
type BoundActionHandlers = { [action: string]: BoundAction };

export default function bindActions(store: Store, actions: ActionHandlers) {
  return Object.keys(actions).reduce(
    (boundActions, actionName) => {
      boundActions[actionName] = actions[actionName].bind(null, store);
      return boundActions;
    },
    {} as BoundActionHandlers
  );
}
