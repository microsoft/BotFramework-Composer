export const DialogStyle = {
  Normal: 'NORMAL',
  Console: 'CONSOLE',
};

export const BuiltInStyles = {
  [DialogStyle.Normal]: {
    padding: '15px',
    marginBottom: '20px',
    whiteSpace: 'pre-line',
  },
  [DialogStyle.Console]: {
    background: '#000',
    color: '#fff',
    padding: '15px',
    marginBottom: '20px',
    whiteSpace: 'pre-line',
  },
};
