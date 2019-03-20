function actionBinder(action, dispatch) {
  return function(...extraArgument) {
    return action(...extraArgument, dispatch);
  };
}

export default function actionsBinder(dispatch) {
  return function(actions) {
    if (typeof actions === 'function') {
      return actionBinder(actions, dispatch);
    }

    if (typeof actions !== 'object' || actions === null) {
      throw new Error('bind actions error');
    }

    const boundActions = {};
    for (const key in actions) {
      const action = actions[key];

      if (typeof action === 'function') {
        boundActions[key] = actionBinder(action, dispatch);
      }
    }

    return boundActions;
  };
}
