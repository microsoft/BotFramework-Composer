// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginConfig } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { LuField } from './LuField';

const config: PluginConfig = {
  recognizers: [
    {
      id: SDKTypes.LuisRecognizer,
      displayName: 'LUIS',
      editor: LuField,
      handleChange: (props, shellData, shellApi) => {
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
