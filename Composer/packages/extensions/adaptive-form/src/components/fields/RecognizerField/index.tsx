// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useMemo } from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import { SDKTypes, MicrosoftIRecognizer } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';

import PluginContext from '../../../PluginContext';
import { FieldLabel } from '../../FieldLabel';

import ToggleEditor from './ToggleEditor';

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

  const getToggleTitle = (type: string) => {
    const title = recognizers.find(r => r.id === type)?.displayName || '';

    return typeof title === 'function' ? title(value) : title;
  };

  // show select for available recognizers
  // available = regex + recognizer with ui:field
  const isRegex = typeof value === 'object' && value.$type === SDKTypes.RegexRecognizer;

  // TODO: how do we determine the recognizer type? Maybe scan the schema?
  const getRecognizerType = (): string => {
    if (typeof value === 'string') {
      return SDKTypes.LuisRecognizer;
    }

    if (isRegex) {
      return SDKTypes.RegexRecognizer;
    }

    return 'none';
  };

  // TODO: make this configurable in the schema?
  const handleChangeRecognizerType = (_, option?: IDropdownOption): void => {
    if (option) {
      const handler = recognizers.find(r => r.id === option.key)?.handleChange;

      if (handler) {
        handler(props, shellData, shellApi);
      }
    }
  };

  const Field = recognizers.find(r => r.id === getRecognizerType())?.editor;

  return (
    <div>
      <FieldLabel id={id} label={label} description={description} helpLink={uiOptions?.helpLink} />
      <Dropdown
        label={formatMessage('Recognizer Type')}
        options={options}
        responsiveMode={ResponsiveMode.large}
        selectedKey={getRecognizerType()}
        onChange={handleChangeRecognizerType}
      />
      {value && (
        <ToggleEditor key={getRecognizerType()} title={getToggleTitle(getRecognizerType())}>
          {Field && <Field {...props} />}
        </ToggleEditor>
      )}
    </div>
  );

  // return (
  //   <Section
  //     description={() => (
  //       <React.Fragment>
  //         To understand what the user says, your dialog needs a &lsquo;Recognizer&rsquo; that includes example words and
  //         sentences that users may use.
  //         <br />
  //         <br />
  //         <a href="https://aka.ms/BFC-Using-LU" rel="noopener noreferrer" target="_blank">
  //           {formatMessage('Learn More')}
  //         </a>
  //       </React.Fragment>
  //     )}
  //     title="Language Understanding"
  //   >
  //   </Section>
  // );
};

export { RecognizerField };
