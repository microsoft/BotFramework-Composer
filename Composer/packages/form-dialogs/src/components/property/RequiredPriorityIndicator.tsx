// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { formDialogSchemaAtom } from 'src/atoms/appState';

const Root = styled(Stack)({
  width: 140,
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
        ? formatMessage('{requiredText} | Priority: {priority}', { requiredText, priority })
        : formatMessage('{requiredText}', { requiredText }),
    [requiredText, priority]
  );

  return (
    <Root horizontal horizontalAlign="end" title={content} verticalAlign="center">
      {<Text>{content}</Text>}
    </Root>
  );
});
