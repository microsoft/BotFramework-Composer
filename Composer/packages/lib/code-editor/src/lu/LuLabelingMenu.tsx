// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuEntity, LuFile } from '@botframework-composer/types';
import formatMessage from 'format-message';
import { ContextualMenu, DirectionalHint, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import React, { useCallback, useEffect, useState } from 'react';

import { isSelectionWithinBrackets } from '../utils/luUtils';

import { useLabelingMenuProps } from './hooks/useLabelingMenuItems';
import { useMonacoSelectedTextDom } from './hooks/useMonacoSelectedTextDom';

type Props = {
  editor: any;
  luFile?: LuFile;
  onMenuToggled?: (visible: boolean) => void;
  onInsertEntity: (entityName: string, entityType: string, method: 'toolbar' | 'floatingMenu') => void;
};

export const LuLabelingMenu = ({ editor, luFile, onMenuToggled, onInsertEntity }: Props) => {
  const [menuTargetElm, setMenuTargetElm] = useState<HTMLElement | null>(null);

  React.useEffect(() => {
    onMenuToggled?.(!!menuTargetElm);
  }, [menuTargetElm]);

  const callback = React.useCallback(
    (data?: { selectedDomElement: HTMLElement; selectedText: string; lineContent: string; selection: any }) => {
      if (!data) {
        setMenuTargetElm(null);
        return;
      }

      const { selectedDomElement, selectedText, lineContent, selection } = data;
      if (
        selectedText.trim() &&
        !isSelectionWithinBrackets(lineContent, selection, selectedText) &&
        selectedDomElement
      ) {
        setMenuTargetElm(selectedDomElement);
      } else {
        setMenuTargetElm(null);
      }
    },
    []
  );

  useMonacoSelectedTextDom(editor, callback);

  useEffect(() => {
    let scrollDisposable: { dispose: () => void };

    if (editor) {
      scrollDisposable = editor.onDidScrollChange(() => {
        setMenuTargetElm(null);
      });
    }

    return () => {
      scrollDisposable?.dispose();
    };
  }, [editor]);

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuTargetElm(null);
      }
    };
    document.addEventListener('keydown', keydownHandler);

    return () => {
      document.removeEventListener('keydown', keydownHandler);
    };
  }, []);

  const itemClick = useCallback(
    (_, item?: IContextualMenuItem) => {
      const entity = item?.data as LuEntity;
      if (entity) {
        onInsertEntity(entity.Name, entity.Type, 'floatingMenu');
      }
      setMenuTargetElm(null);
    },
    [onInsertEntity]
  );

  const { menuProps, noEntities } = useLabelingMenuProps('filter', luFile, itemClick, {
    menuHeaderText: formatMessage('Tag entity'),
  });

  return menuTargetElm && !noEntities ? (
    <ContextualMenu
      {...menuProps}
      directionalHint={DirectionalHint.bottomLeftEdge}
      hidden={false}
      shouldFocusOnMount={false}
      target={menuTargetElm}
    />
  ) : null;
};
