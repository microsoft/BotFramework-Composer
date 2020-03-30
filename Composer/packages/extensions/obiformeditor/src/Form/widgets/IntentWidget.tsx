// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { SDKTypes } from '@bfc/shared';
import { DialogInfo } from '@bfc/indexers';
import { Pivot, PivotLinkSize, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

import { BFDWidgetProps } from '../types';
import { tabs } from '../fields/PromptField/styles';
import { IRecognizerType } from '../fields/RecognizerField/types';

import { LuEditorWidget } from './LuEditorWidget';
import { RegexEditorWidget } from './RegexEditorWidget';
import { WidgetLabel } from './WidgetLabel';

function recognizerType({ content }: DialogInfo): SDKTypes {
  const recognizer: IRecognizerType | string = content.recognizer.recognizers[0].recognizers?.['en-us'];

  if (typeof recognizer === 'string' && !!recognizer) {
    return SDKTypes.LuisRecognizer;
  } else if (typeof recognizer === 'object') {
    return SDKTypes.RegexRecognizer;
  }
  return SDKTypes.ValueRecognizer;
}

export const IntentWidget: React.FC<BFDWidgetProps> = props => {
  const { value, formContext, label } = props;
  const { currentDialog } = formContext;

  const type = recognizerType(currentDialog);

  return (
    <>
      <WidgetLabel label={label} />
      <Pivot linkSize={PivotLinkSize.large} styles={tabs} defaultSelectedKey={SDKTypes.ValueRecognizer}>
        <PivotItem
          headerText={formatMessage('Luis')}
          itemKey={SDKTypes.LuisRecognizer}
          headerButtonProps={{
            disabled: type !== SDKTypes.LuisRecognizer,
          }}
        >
          <LuEditorWidget formContext={formContext} name={value} height={316} />
        </PivotItem>
        <PivotItem
          headerText={formatMessage('Regex')}
          itemKey={SDKTypes.RegexRecognizer}
          headerButtonProps={{
            disabled: type !== SDKTypes.RegexRecognizer,
          }}
        >
          <RegexEditorWidget formContext={formContext} name={value} />
        </PivotItem>
        <PivotItem headerText={formatMessage('Value')} itemKey={SDKTypes.ValueRecognizer}>
          <div>Intent name: {value}</div>
        </PivotItem>
      </Pivot>
    </>
  );
};
