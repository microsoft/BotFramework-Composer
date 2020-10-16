// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { NeutralColors } from '@uifabric/fluent-theme';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';

const Title = styled(ActionButton)(({ isCollapsed }: { isCollapsed: boolean }) => ({
  width: 'fit-content',
  minWidth: 200,
  margin: 0,
  padding: 0,
  '& i': {
    marginTop: '4px',
    transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
    transition: '250ms transform ease',
    color: NeutralColors.gray120,
  },
}));

type Props = React.PropsWithChildren<{
  collapsed?: boolean;
  onRenderTitle: () => React.ReactNode;
  onToggleCollapsed?: (collapsed: boolean) => void;
}>;

export const Collapsible = (props: Props) => {
  const { collapsed = false, onRenderTitle, onToggleCollapsed, children } = props;

  const { 0: isCollapsed, 1: setCollapsed } = React.useState(collapsed);

  React.useEffect(() => {
    if (collapsed !== isCollapsed) {
      setCollapsed(collapsed);
    }
  }, [collapsed]);

  const click = React.useCallback(() => {
    const newCollapsed = !isCollapsed;
    setCollapsed(newCollapsed);
    if (onToggleCollapsed) {
      onToggleCollapsed(newCollapsed);
    }
  }, [isCollapsed, onToggleCollapsed]);

  return (
    <Stack>
      <Title
        isCollapsed={isCollapsed}
        menuIconProps={{ iconName: 'ChevronRight', styles: { root: { fontSize: 8, margin: '8px 8px 0 0' } } }}
        onClick={click}
      >
        {onRenderTitle()}
      </Title>
      {!isCollapsed && children}
    </Stack>
  );
};
