// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuFile } from '@botframework-composer/types';
import { FluentTheme } from '@uifabric/fluent-theme';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import * as React from 'react';

import { canInsertEntityBySelection, canTagEntityBySelection } from '../utils/luUtils';
import { MonacoRange } from '../utils/monacoTypes';

import { DefineEntityButton } from './DefineEntityButton';
import { InsertEntityButton } from './InsertEntityButton';
import { ToolbarLuEntityType } from './types';

const menuHeight = 32;

const commandBarStyles = {
  root: {
    height: menuHeight,
    padding: 0,
    fontSize: FluentTheme.fonts.small.fontSize,
  },
};

type Props = {
  editor?: any;
  className?: string;
  luFile?: LuFile;
  labelingMenuVisible: boolean;
  onDefineEntity: (
    entityType: ToolbarLuEntityType,
    data: Partial<{ entityName: string; entityDefinition: string }>
  ) => void;
  onInsertEntity: (entityName: string, entityType: string) => void;
  options?: Partial<{
    disabled: boolean;
    tooltip: string;
  }>;
};

export const LuEditorToolbar = React.memo((props: Props) => {
  const { editor, luFile, labelingMenuVisible, className, onDefineEntity, onInsertEntity, options } = props;

  const [insertEntityDisabled, setInsertEntityDisabled] = React.useState(true);
  const [tagEntityDisabled, setTagEntityDisabled] = React.useState(true);

  React.useEffect(() => {
    const listeners: { dispose: () => void }[] = [];
    if (editor) {
      listeners.push(
        editor.onDidChangeCursorSelection((e) => {
          setInsertEntityDisabled(!canInsertEntityBySelection(editor, e.selection as MonacoRange));
          setTagEntityDisabled(!canTagEntityBySelection(editor, e.selection as MonacoRange));
        })
      );
    }

    return () => listeners.forEach((l) => l.dispose());
  }, [editor]);

  const defineLuEntityItem: ICommandBarItemProps = React.useMemo(() => {
    return {
      key: 'defineLuEntityItem',
      commandBarButtonAs: () => (
        <DefineEntityButton
          disabled={options?.disabled}
          luFile={luFile}
          tooltip={options?.tooltip}
          onDefineEntity={onDefineEntity}
        />
      ),
    };
  }, [onDefineEntity]);

  const useLuEntityItem: ICommandBarItemProps = React.useMemo(() => {
    return {
      key: 'useLuEntityItem',
      commandBarButtonAs: () => (
        <InsertEntityButton
          disabled={options?.disabled}
          insertEntityDisabled={insertEntityDisabled}
          labelingMenuVisible={labelingMenuVisible}
          luFile={luFile}
          tagEntityDisabled={tagEntityDisabled}
          tooltip={options?.tooltip}
          onInsertEntity={onInsertEntity}
        />
      ),
    };
  }, [labelingMenuVisible, insertEntityDisabled, tagEntityDisabled, luFile, onInsertEntity]);

  const items = React.useMemo(() => [defineLuEntityItem, useLuEntityItem], [useLuEntityItem, defineLuEntityItem]);

  return <CommandBar className={className} items={items} styles={commandBarStyles} />;
});
