// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@botframework-composer/types';
import { NeutralColors } from '@uifabric/fluent-theme';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';
import formatMessage from 'format-message';

import { withTooltip } from '../utils/withTooltip';

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

  const TooltipTemplateButton = withTooltip(
    { content: formatMessage('Insert a template reference') },
    ToolbarButtonMenu
  );
  const TooltipPropertyButton = withTooltip(
    { content: formatMessage('Insert a property reference in memory') },
    ToolbarButtonMenu
  );
  const TooltipFunctionButton = withTooltip(
    { content: formatMessage('Insert an adaptive expression pre-built function') },
    ToolbarButtonMenu
  );

  return (
    <Stack horizontal styles={toolbarContainerStyle}>
      <TooltipTemplateButton
        key="templateRef"
        disabled={!templateRefPayload?.data?.templates?.length}
        payload={templateRefPayload}
      />
      <TooltipPropertyButton
        key="propertyRef"
        disabled={!propertyRefPayload?.data?.properties?.length}
        payload={propertyRefPayload}
      />
      <TooltipFunctionButton key="functionRef" payload={functionRefPayload} />
    </Stack>
  );
});
