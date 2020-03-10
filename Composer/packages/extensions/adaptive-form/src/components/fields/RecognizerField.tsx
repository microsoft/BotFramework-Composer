// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useMemo } from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import { SDKTypes, MicrosoftIRecognizer } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import PluginContext from '../../PluginContext';
import { FieldLabel } from '../FieldLabel';

const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = props => {
  const { value, id, label, description, uiOptions } = props;
  const { shellApi, ...shellData } = useShellApi();
  const { recognizers } = useContext(PluginContext);

  const options = useMemo(() => {
    return recognizers.map(r => ({
      key: r.id,
      text: typeof r.displayName === 'function' ? r.displayName(value) : r.displayName,
    }));
  }, [recognizers]);

  // TODO: how do we determine the recognizer type? Maybe scan the schema?
  const getRecognizerType = (): string => {
    if (typeof value === 'string') {
      return SDKTypes.LuisRecognizer;
    }

    if (typeof value === 'object' && value.$type === SDKTypes.RegexRecognizer) {
      return SDKTypes.RegexRecognizer;
    }

    return 'none';
  };

  const handleChangeRecognizerType = (_, option?: IDropdownOption): void => {
    if (option) {
      const handler = recognizers.find(r => r.id === option.key)?.handleChange;

      if (handler) {
        handler(props, shellData, shellApi);
      }
    }
  };

  return (
    <React.Fragment>
      <FieldLabel id={id} label={label} description={description} helpLink={uiOptions?.helpLink} />
      <Dropdown
        label={formatMessage('Recognizer Type')}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={getRecognizerType()}
        onChange={handleChangeRecognizerType}
      />
    </React.Fragment>
  );
};

export { RecognizerField };
