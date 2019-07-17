import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

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
    maxHeight: '90px',
    overflowY: 'auto',
    fontSize: '16px',
    lineHeight: '23px',
    color: '#fff',
    padding: '10px 15px',
    marginBottom: '20px',
    whiteSpace: 'pre-line',
  },
};

export const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

export const dialogModal = {
  main: {
    maxWidth: '450px',
  },
};
