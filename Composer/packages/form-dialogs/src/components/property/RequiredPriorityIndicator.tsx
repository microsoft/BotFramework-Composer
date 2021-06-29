// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { formDialogSchemaAtom } from '../../atoms/appState';
import { HelpTooltip } from '../common/HelpTooltip';

const Root = styled(Stack)({
  width: 150,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

type Props = {
  required: boolean;
  propertyId: string;
};

const usePropertyPriority = (required: boolean, propertyId: string) => {
  const { requiredPropertyIds, optionalPropertyIds } = useRecoilValue(formDialogSchemaAtom);

  return React.useMemo(
    () => (required ? requiredPropertyIds.indexOf(propertyId) : optionalPropertyIds.indexOf(propertyId)),
    [required, propertyId, requiredPropertyIds, optionalPropertyIds]
  );
};

export const RequiredPriorityIndicator = React.memo((props: Props) => {
  const { required, propertyId } = props;
  const priority = usePropertyPriority(required, propertyId) + 1;

  const requiredText = React.useMemo(() => (required ? formatMessage('Required') : formatMessage('Optional')), [
    required,
  ]);

  const content = React.useMemo(
    () =>
      required
        ? formatMessage.rich(
            '{requiredText} | Priority <help>Priority refers to the order in which the bot will ask for the required properties.</help> : {priority}',
            {
              requiredText,
              priority,
              help: ({ children }) => (
                <HelpTooltip
                  key={`${propertyId}-priority-tooltip`}
                  helpMessage={children}
                  tooltipId={`${propertyId}-priority-tooltip`}
                />
              ),
            }
          )
        : formatMessage('{requiredText}', { requiredText }),
    [requiredText, priority]
  );

  return (
    <Root horizontal horizontalAlign="end" verticalAlign="center">
      {<Text>{content}</Text>}
    </Root>
  );
});
