// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useMemo, useEffect } from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';

import PluginContext from '../../PluginContext';
import { FieldLabel } from '../FieldLabel';

const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = (props) => {
  const { value, id, label, description, uiOptions, required, onChange } = props;
  const { shellApi, ...shellData } = useShellApi();
  const { recognizers } = useContext(PluginContext);

  useEffect(() => {
    if (value === undefined) {
      const { qnaFiles, luFiles, currentDialog, locale } = shellData;
      const qnaFile = qnaFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
      const luFile = luFiles.find((f) => f.id === `${currentDialog.id}.${locale}`);
      if (qnaFile && luFile) {
        onChange({
          $kind: SDKKinds.CrossTrainedRecognizerSet,
          recognizers: [`${luFile.id.split('.')[0]}.lu`, `${qnaFile.id.split('.')[0]}.qna`],
        });
      }
    }
  }, [value]);
  const options = useMemo(() => {
    return recognizers.map((r) => ({
      key: r.id,
      text: typeof r.displayName === 'function' ? r.displayName(value) : r.displayName,
    }));
  }, [recognizers]);

  const selectedType = useMemo(() => {
    const selected =
      value === undefined ? [recognizers[0].id] : recognizers.filter((r) => r.isSelected(value)).map((r) => r.id);

    if (selected.length !== 1) {
      console.error(
        `Unable to determine selected recognizer.\n
         Value: ${JSON.stringify(value)}.\n
         Selected Recognizers: [${selected.join(', ')}]`
      );
      return;
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
          data-testid={'recognizerTypeDropdown'}
          label={formatMessage('Recognizer Type')}
          options={options}
          responsiveMode={ResponsiveMode.large}
          selectedKey={selectedType}
          onChange={handleChangeRecognizerType}
        />
      ) : (
        `Unable to determine recognizer type from data: ${value}`
      )}
      {selectedType === 'Custom' && (
        <TextField
          multiline
          resizable={false}
          rows={10}
          styles={{ root: { marginTop: '10px' } }}
          value={value as string}
          onChange={(_, newValue) => onChange(newValue)}
        />
      )}
    </React.Fragment>
  );
};

export { RecognizerField };
