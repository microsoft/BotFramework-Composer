// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';
import { HelpTooltip } from 'src/components/common/HelpTooltip';

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
      <HelpTooltip helpMessage={props.helpText} tooltipId={props.tooltipId} />
    </Stack>
  );
});
