// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { generateSDKTitle } from '@bfc/shared';
import get from 'lodash/get';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { FormCard } from '../components/nodes/templates/FormCard';
import { WidgetContainerProps, WidgetComponent } from '../schema/uischema.types';
import { ObiColors } from '../constants/ElementColors';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { NodeMenu } from '../components/menus/NodeMenu';

export interface DialogRefCardProps extends WidgetContainerProps {
  dialog: string | object;
  getRefContent?: (dialogRef: JSX.Element) => JSX.Element;
  colors?: {
    theme: string;
    icon: string;
  };
}

const DefaultCardColor = {
  theme: ObiColors.AzureGray3,
  icon: ObiColors.AzureGray2,
};

export const DialogRefCard: WidgetComponent<DialogRefCardProps> = ({
  id,
  data,
  onEvent,
  dialog,
  getRefContent,
  colors = DefaultCardColor,
}) => {
  const header = generateSDKTitle(data);
  const nodeColors = { themeColor: colors.theme, iconColor: colors.icon };
  const calleeDialog = typeof dialog === 'object' ? get(dialog, '$ref') : dialog;
  const dialogRef = (
    <Link
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: calleeDialog });
      }}
    >
      {calleeDialog}
    </Link>
  );
  return (
    <FormCard
      header={header}
      corner={<NodeMenu id={id} onEvent={onEvent} />}
      label={typeof getRefContent === 'function' ? getRefContent(dialogRef) : dialogRef}
      nodeColors={nodeColors}
    />
  );
};
