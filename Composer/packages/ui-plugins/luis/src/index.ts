// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { LuisIntentEditor } from './LuisIntentEditor';

const config: PluginConfig = {
  recognizers: [
    {
      id: SDKTypes.LuisRecognizer,
      displayName: 'LUIS',
      editor: LuisIntentEditor,
      isSelected: data => {
        return typeof data === 'string' && data.endsWith('.lu');
      },
      handleRecognizerChange: (props, shellData) => {
        const { luFiles, currentDialog, locale } = shellData;
        const luFile = luFiles.find(f => f.id === `${currentDialog.id}.${locale}`);

        if (luFile) {
          // strip locale out of id so it doesn't get serialized
          // into the .dialog file
          props.onChange(`${luFile.id.split('.')[0]}.lu`);
        } else {
          alert(`NO LU FILE WITH NAME ${currentDialog.id}`);
        }
      },
    },
  ],
};

export default config;
