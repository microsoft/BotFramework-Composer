// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@botframework-composer/types';
import { NeutralColors } from '@uifabric/fluent-theme';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';

import { ToolbarButtonMenu } from './ToolbarButtonMenu';
import { useLgEditorToolbarItems } from './useLgEditorToolbarItems';

const toolbarContainerStyle = {
  root: {
    border: `1px solid ${NeutralColors.gray120}`,
    borderBottom: 'none',
  },
};

type Props = {
  lgTemplates?: readonly LgTemplate[];
  properties?: readonly string[];
  onSelectToolbarMenuItem: (itemText: string) => void;
};

export const LgEditorToolbar = React.memo((props: Props) => {
  const { properties, lgTemplates, onSelectToolbarMenuItem } = props;

  const { functionRefPayload, propertyRefPayload, templateRefPayload } = useLgEditorToolbarItems(
    lgTemplates ?? [],
    properties ?? [],
    onSelectToolbarMenuItem
  );

  return (
    <Stack horizontal styles={toolbarContainerStyle}>
      <ToolbarButtonMenu
        key="templateRef"
        disabled={!templateRefPayload?.data?.templates?.length}
        payload={templateRefPayload}
      />
      <ToolbarButtonMenu
        key="propertyRef"
        disabled={!propertyRefPayload?.data?.properties?.length}
        payload={propertyRefPayload}
      />
      <ToolbarButtonMenu key="functionRef" payload={functionRefPayload} />
    </Stack>
  );
});
