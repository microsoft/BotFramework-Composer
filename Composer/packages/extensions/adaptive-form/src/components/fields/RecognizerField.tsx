// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo, useState, useEffect } from 'react';
import { FieldProps, useShellApi, useRecognizerConfig } from '@bfc/extension';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { JsonEditor } from '@bfc/code-editor';

import { FieldLabel } from '../FieldLabel';

const RecognizerField: React.FC<FieldProps<MicrosoftIRecognizer>> = (props) => {
  const { value, id, label, description, uiOptions, required, onChange } = props;
  const { shellApi, ...shellData } = useShellApi();
  const recognizers = useRecognizerConfig();
  const [isCustomType, setIsCustomType] = useState(false);

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
    if (isCustomType) {
      return 'Custom';
    }
    let selected =
      value === undefined ? [recognizers[0].id] : recognizers.filter((r) => r.isSelected(value)).map((r) => r.id);

    const involvedCustomItem = selected.find((item) => item !== 'Custom');
    if (involvedCustomItem) {
      selected = selected.filter((item) => item !== 'Custom');
      if (selected.length === 0) {
        return involvedCustomItem;
      }
    }
    if (selected.length < 1) {
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

    if (selected[0] === SDKKinds.LuisRecognizer) {
      selected[0] = SDKKinds.CrossTrainedRecognizerSet;
    }
    return selected[0];
  }, [value]);

  const handleChangeRecognizerType = (_, option?: IDropdownOption): void => {
    if (option) {
      if (option.key === 'Custom') {
        setIsCustomType(true);
      } else {
        setIsCustomType(false);
      }

      const handler = recognizers.find((r) => r.id === option.key)?.handleRecognizerChange;

      if (handler) {
        handler(props, shellData, shellApi);
      }
    }
  };

  const handleCustomChange = (value: string): void => {
    setIsCustomType(true);
    onChange(value);
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
          onChange={handleCustomChange}
        />
      )}
    </React.Fragment>
  );
};

export { RecognizerField };
