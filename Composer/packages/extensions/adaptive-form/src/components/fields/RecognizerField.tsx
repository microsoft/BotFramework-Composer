// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo, useEffect } from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { JsonEditor } from '@bfc/code-editor';

import { FieldLabel } from '../FieldLabel';
import { usePluginConfig } from '../../hooks';

const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = (props) => {
  const { value, id, label, description, uiOptions, required, onChange } = props;
  const { shellApi, ...shellData } = useShellApi();
  const { recognizers } = usePluginConfig();

  useEffect(() => {
    if (value === undefined) {
      const { qnaFiles, luFiles, currentDialog, locale } = shellData;
      const qnaFile = qnaFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
      const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
      if (qnaFile && luFile) {
        onChange(`${currentDialog.id}.lu.qna`);
      }
    }
  }, [value]);
  const options = useMemo(() => {
    return recognizers
      .filter((r) => r.id !== SDKKinds.LuisRecognizer)
      .map((r) => ({
        key: r.id,
        text: typeof r.displayName === 'function' ? r.displayName(value) : r.displayName,
      }));
  }, [recognizers]);

  const selectedType = useMemo(() => {
    let selected =
      value === undefined ? [recognizers[0].id] : recognizers.filter((r) => r.isSelected(value)).map((r) => r.id);

    const involvedCustomItem = selected.find((item) => item !== 'Custom');
    if (involvedCustomItem) {
      selected = selected.filter((item) => item !== 'Custom');
      if (selected.length === 0) {
        return involvedCustomItem;
      }
    }

    if (selected.length !== 1) {
      /* istanbul ignore next */
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `Unable to determine selected recognizer.\n
         Value: ${JSON.stringify(value)}.\n
         Selected Recognizers: [${selected.join(', ')}]`
        );
      }
      return;
    }

    if (selected[0] === 'Luis') {
      selected[0] = 'Luis + QnA';
    }
    return selected[0];
  }, [value]);

  const handleChangeRecognizerType = (_, option?: IDropdownOption): void => {
    if (option) {
      const handler = recognizers.find((r) => r.id === option.key)?.handleRecognizerChange;

      if (handler) {
        handler(props, shellData, shellApi);
      }
    }
  };

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      {selectedType ? (
        <Dropdown
          data-testid="recognizerTypeDropdown"
          label={formatMessage('Recognizer Type')}
          options={options}
          responsiveMode={ResponsiveMode.large}
          selectedKey={selectedType}
          onChange={handleChangeRecognizerType}
        />
      ) : (
        formatMessage('Unable to determine recognizer type from data: {value}', { value })
      )}
      {selectedType === 'Custom' && (
        <JsonEditor
          key={'customRecognizer'}
          height={200}
          id={'customRecog'}
          value={value as object}
          onChange={onChange}
        />
      )}
    </React.Fragment>
  );
};

export { RecognizerField };
