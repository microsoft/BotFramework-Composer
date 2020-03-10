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
      handleChange: (props, shellData) => {
        const { luFiles, dialogId } = shellData;
        const luFile = luFiles.find(f => f.id === dialogId);

        if (luFile) {
          props.onChange(luFile.id);
        } else {
          alert(`NO LU FILE WITH NAME ${dialogId}`);
        }
      },
    },
  ],
};

export default config;
