// this is currently hard-coded here

import FormEditor from 'composer-extensions/obieditortest';
import VisualDesigner from 'composer-extensions/visual-designer';

const getEditor = () => {
  // i'm now more towarding pick editor based on name, not data
  // because we want shell to totally control file read/save
  // which means each editor cann't be differiante by data
  if (window.name === 'VisualEditor') {
    return VisualDesigner;
  }

  if (windw.name === 'FormEditor') {
    return FormEditor;
  }
  return null;
};

export default getEditor;
