export default function bindActions(dispatch, actions) {
  return Object.keys(actions).reduce((boundActions, actionName) => {
    boundActions[actionName] = actions[actionName].bind(null, dispatch);
    return boundActions;
  }, {});
}
