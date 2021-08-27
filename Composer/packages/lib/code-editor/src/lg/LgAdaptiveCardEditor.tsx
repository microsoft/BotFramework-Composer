// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

import { LgCodeEditorProps } from '../types';
import { JsonEditor } from '../JsonEditor';

import { AdaptiveCardRenderer } from './AdaptiveCardRenderer';
import { getAdaptiveCard, convertToLgString } from './utils';

type Props = LgCodeEditorProps;

export const LgAdaptiveCardEditor: React.FC<Props> = (props) => {
  const { onChange } = props;
  const [cardTemplate, setCardTemplate] = React.useState(getAdaptiveCard(props.value));

  const handleChange = React.useCallback(
    (data) => {
      onChange(convertToLgString(data));
      setCardTemplate(data);
    },
    [onChange]
  );

  return (
    <Stack grow horizontal tokens={{ childrenGap: '8px' }}>
      <Stack.Item styles={{ root: { width: '100%' } }}>
        <JsonEditor {...props} height={'100%'} value={cardTemplate || {}} onChange={handleChange} />
      </Stack.Item>
      <AdaptiveCardRenderer card={cardTemplate} />
    </Stack>
  );
};
