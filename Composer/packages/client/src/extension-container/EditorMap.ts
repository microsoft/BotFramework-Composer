// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// this is currently hard-coded here
// import FormEditor from '@bfc/extensions/obiformeditor';
import VisualDesigner from '@bfc/visual-designer';
import AdaptiveForm from '@bfc/adaptive-form';

const getEditor = (): typeof VisualDesigner | typeof AdaptiveForm | null => {
  // i'm now more towarding pick editor based on name, not data
  // because we want shell to totally control file read/save
  // which means each editor cann't be differiante by data
  if (window.name === 'VisualEditor') {
    return VisualDesigner;
  }

  if (window.name === 'FormEditor') {
    return AdaptiveForm;
  }
  return null;
};

export default getEditor;
