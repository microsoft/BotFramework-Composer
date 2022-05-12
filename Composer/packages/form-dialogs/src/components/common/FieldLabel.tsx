// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import * as React from 'react';

import { HelpTooltip } from './HelpTooltip';

type Props = {
  tooltipId: string;
  helpText: string;
  defaultRender: React.ReactNode;
  optional?: boolean;
};

export const FieldLabel = React.memo((props: Props) => {
  return (
    <Stack horizontal tokens={{ childrenGap: 4 }} verticalAlign="center">
      {props.defaultRender}
      {props.optional ? <Text styles={{ root: { fontStyle: 'italic' } }}>({formatMessage('optional')})</Text> : null}
      <HelpTooltip aria-label={props.helpText} helpMessage={props.helpText} tooltipId={props.tooltipId} />
    </Stack>
  );
});
