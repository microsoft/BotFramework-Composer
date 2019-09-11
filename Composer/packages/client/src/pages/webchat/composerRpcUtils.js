export const runRpcCommand = command => {
  try {
    eval(command);
    console.log('composer-rpc execution success!', command);
  } catch (e) {
    console.error(e.message);
    window.alert(command);
  }
};

const RpcPrefix = 'composer-rpc://';
const isRpcMessage = activity => {
  return activity.type === 'message' && activity.text && activity.text.indexOf(RpcPrefix) === 0;
};
const getCmdFromRpcMessage = activity => {
  const cmd = activity.text.replace(RpcPrefix, '');
  return cmd;
};

const isRpcEvent = activity => {
  return activity.type === 'event' && activity.name === 'composer-rpc';
};
const getCmdFromRpcEvent = activity => {
  return activity.value;
};

export const tryExtractRpcCommandFromActivity = activity => {
  if (isRpcMessage(activity)) {
    console.log('composer-rpc text protocol', activity);
    return getCmdFromRpcMessage(activity);
  }

  if (isRpcEvent(activity)) {
    console.log('composer-rpc event received', activity);
    return getCmdFromRpcEvent(activity);
  }

  return null;
};
