// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Icon } from '@fluentui/react/lib/Icon';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { Announced } from '@fluentui/react/lib/Announced';
import * as React from 'react';

const searchEmptyMessageStyles = { root: { height: 32 } };
const searchEmptyMessageTokens = { childrenGap: 8 };

/**
 * Search empty view for contextual menu with search capability.
 */
export const useNoSearchResultMenuItem = (message?: string): IContextualMenuItem => {
  message = message ?? formatMessage('no items found');
  return React.useMemo(
    () => ({
      key: 'no_results',
      onRender: () => (
        <Stack
          key="no_results"
          horizontal
          horizontalAlign="center"
          styles={searchEmptyMessageStyles}
          tokens={searchEmptyMessageTokens}
          verticalAlign="center"
        >
          <Icon iconName="SearchIssue" title={message} />
          <Announced message={message} role="alert" />
          <Text variant="small">{message}</Text>
        </Stack>
      ),
    }),
    [message]
  );
};
