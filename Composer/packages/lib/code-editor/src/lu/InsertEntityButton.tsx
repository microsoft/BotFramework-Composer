// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuEntity, LuFile } from '@botframework-composer/types';
import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { CommandBarButton as DefaultCommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import * as React from 'react';

import { withTooltip } from '../utils/withTooltip';

import { jsLuToolbarMenuClassName } from './constants';
import { useLabelingMenuProps } from './hooks/useLabelingMenuItems';
import { getLuToolbarItemTextAndIcon } from './iconUtils';

const fontSizeStyle = {
  fontSize: FluentTheme.fonts.small.fontSize,
};
const buttonStyles = {
  root: {
    height: 32,
    '&:hover .ms-Button-flexContainer i, &:active .ms-Button-flexContainer i, &.is-expanded .ms-Button-flexContainer i': {
      color: FluentTheme.palette.black,
    },
  },
  menuIcon: { fontSize: 8, color: FluentTheme.palette.black },
  label: { ...fontSizeStyle },
  icon: { color: FluentTheme.palette.black, fontSize: 12 },
};

type Props = {
  onInsertEntity: (entityName: string, eventType: string) => void;
  labelingMenuVisible: boolean;
  insertEntityDisabled: boolean;
  tagEntityDisabled: boolean;
  luFile?: LuFile;
};

const getCommandBarButton = (tooltipContent: string) =>
  withTooltip({ content: tooltipContent }, DefaultCommandBarButton);

export const InsertEntityButton = React.memo((props: Props) => {
  const { luFile, labelingMenuVisible, tagEntityDisabled, insertEntityDisabled, onInsertEntity } = props;

  const itemClick = React.useCallback(
    (_, item?: IContextualMenuItem) => {
      const entity = item?.data as LuEntity;
      if (entity) {
        onInsertEntity(entity.Name, entity.Type);
      }
    },
    [onInsertEntity]
  );

  const { menuProps, noEntities } = useLabelingMenuProps(labelingMenuVisible ? 'disable' : 'none', luFile, itemClick, {
    menuHeaderText: labelingMenuVisible ? formatMessage('Tag entity') : undefined,
  });

  const mode = React.useMemo(() => (labelingMenuVisible ? 'tag' : 'insert'), [labelingMenuVisible]);
  const disabled = React.useMemo(
    () => noEntities || (mode === 'tag' && tagEntityDisabled) || (mode === 'insert' && insertEntityDisabled),
    [mode, noEntities, insertEntityDisabled, tagEntityDisabled]
  );

  const { iconName, text } = React.useMemo(
    () => getLuToolbarItemTextAndIcon(labelingMenuVisible ? 'tagEntity' : 'useEntity'),
    [labelingMenuVisible]
  );

  const CommandBarButton = React.useMemo(
    () =>
      getCommandBarButton(labelingMenuVisible ? formatMessage('Tag entity') : formatMessage('Insert defined entity')),
    [labelingMenuVisible]
  );

  return (
    <CommandBarButton
      className={jsLuToolbarMenuClassName}
      data-testid="menuButton"
      disabled={disabled}
      iconProps={{ iconName }}
      menuProps={menuProps}
      styles={buttonStyles}
    >
      {text}
    </CommandBarButton>
  );
});
