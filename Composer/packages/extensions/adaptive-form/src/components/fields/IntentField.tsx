// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps, useShellApi, IRecognizerType } from '@bfc/extension';
import { DialogInfo, SDKKinds } from '@bfc/shared';
import formatMessage from 'format-message';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

import { usePluginConfig } from '../../hooks';
import { FieldLabel } from '../FieldLabel';

import { tabs } from './styles';

// TODO: extend recognizer config to support this
export function recognizerType({ content }: DialogInfo): string | undefined {
  const recognizer: IRecognizerType | string = content.recognizer.recognizers[0].recognizers?.['en-us'];

  if (typeof recognizer === 'string' && recognizer.includes('.lu')) {
    return SDKKinds.LuisRecognizer;
  } else if (typeof recognizer === 'string' && recognizer.includes('.qna')) {
    return SDKKinds.QnaRecognizer;
  } else if (typeof recognizer === 'object' && recognizer.$kind === SDKKinds.RegexRecognizer) {
    return SDKKinds.RegexRecognizer;
  } else if (typeof recognizer === 'object' && recognizer.$kind === SDKKinds.CrossTrainedRecognizerSet) {
    return SDKKinds.CrossTrainedRecognizerSet;
  }
  return SDKKinds.ValueRecognizer;
}

const IntentField: React.FC<FieldProps> = props => {
  const { id, description, uiOptions, value, onChange } = props;
  const { currentDialog } = useShellApi();
  const { recognizers } = usePluginConfig();
  const type = recognizerType(currentDialog);

  const handleChange = () => {
    onChange(value);
  };

  const label = formatMessage('Trigger phrases (intent: #{intentName})', { intentName: value });

  const editorRender = type => {
    const Editor = recognizers.find(r => r.id === type)?.editor;

    return Editor ? <Editor {...props} onChange={handleChange} /> : `No Editor for ${type}`;
  };
  return (
    <React.Fragment>
      <FieldLabel id={id} label={label} description={description} helpLink={uiOptions?.helpLink} />
      <Pivot linkSize={PivotLinkSize.large} styles={tabs} defaultSelectedKey={type}>
        <PivotItem
          headerText={formatMessage('Luis')}
          itemKey={SDKKinds.LuisRecognizer}
          headerButtonProps={{
            disabled: !(type === SDKKinds.LuisRecognizer || type === SDKKinds.CrossTrainedRecognizerSet),
          }}
        >
          {editorRender(SDKKinds.LuisRecognizer)}
        </PivotItem>
        <PivotItem
          headerText={formatMessage('QnA')}
          itemKey={SDKKinds.QnaRecognizer}
          headerButtonProps={{
            disabled: !(type === SDKKinds.QnaRecognizer || type === SDKKinds.CrossTrainedRecognizerSet),
          }}
        >
          {editorRender(SDKKinds.QnaRecognizer)}
        </PivotItem>
        <PivotItem
          headerText={formatMessage('Regex')}
          itemKey={SDKKinds.RegexRecognizer}
          headerButtonProps={{
            disabled: type !== SDKKinds.RegexRecognizer,
          }}
        >
          {editorRender(SDKKinds.RegexRecognizer)}
        </PivotItem>
        <PivotItem headerText={formatMessage('Value')} itemKey={SDKKinds.ValueRecognizer}>
          <div>Intent name: {value}</div>
        </PivotItem>
      </Pivot>
    </React.Fragment>
  );
};

export { IntentField };
