// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useMemo } from 'react';
import formatMessage from 'format-message';
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { useRecoilValue } from 'recoil';
import { PluginConfig } from '@bfc/extension-client';
import { DialogInfo } from '@bfc/shared';
import get from 'lodash/get';

import { TreeLink } from '../../components/ProjectTree/ProjectTree';
import {
  designPageLocationState,
  dialogsSelectorFamily,
  dispatcherState,
  visualEditorSelectionState,
} from '../../recoilModel';
import { getDialogData, getFriendlyName } from '../../utils/dialogUtil';
import { decodeDesignerPathToArrayPath } from '../../utils/convertUtils/designerPathEncoder';
import { getFocusPath } from '../../utils/navigation';

import { breadcrumbClass } from './styles';

type BreadcrumbItem = {
  key: string;
  label: string;
  link?: Partial<TreeLink>;
  onClick?: () => void;
};

type VisualEditorHeaderProps = {
  projectId: string;
  visible: boolean;
  showCode: boolean;
  onShowCodeClick: () => void;
  pluginConfig?: PluginConfig;
};

// field types
const Types = {
  Dialog: 'D',
  Trigger: 'T',
  Action: 'A',
};

const parseTriggerId = (triggerId: string | undefined): number | undefined => {
  if (triggerId == null) return undefined;
  const indexString = triggerId.match(/\d+/)?.[0];
  if (indexString == null) return undefined;
  return parseInt(indexString);
};

const getActionName = (action, pluginConfig?: PluginConfig) => {
  const nameFromAction = action?.$designer?.name as string | undefined;
  let detectedActionName: string;

  if (typeof nameFromAction === 'string') {
    detectedActionName = nameFromAction;
  } else {
    const kind: string = action?.$kind as string;
    const actionNameFromSchema = pluginConfig?.uiSchema?.[kind]?.form?.label as string | (() => string) | undefined;
    if (typeof actionNameFromSchema === 'string') {
      detectedActionName = actionNameFromSchema;
    } else if (typeof actionNameFromSchema === 'function') {
      detectedActionName = actionNameFromSchema();
    } else {
      detectedActionName = formatMessage('Unknown');
    }
  }
  return detectedActionName;
};

const useBreadcrumbs = (projectId: string, pluginConfig?: PluginConfig) => {
  const designPageLocation = useRecoilValue(designPageLocationState(projectId));
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const { navTo } = useRecoilValue(dispatcherState);

  const { dialogId, selected: encodedSelect, focused: encodedFocused } = designPageLocation;
  const dialogMap = dialogs.reduce((acc, { content, id }) => ({ ...acc, [id]: content }), {});
  const dialogData = getDialogData(dialogMap, dialogId);
  const selected = decodeDesignerPathToArrayPath(dialogData, encodedSelect ?? '');
  const focused = decodeDesignerPathToArrayPath(dialogData, encodedFocused ?? '');

  // TODO: get these from a second return value from decodeDesignerPathToArrayPath
  const triggerIndex = parseTriggerId(selected);
  //make sure focusPath always valid
  const focusPath = getFocusPath(selected, focused);
  const trigger = triggerIndex != null && dialogData.triggers[triggerIndex];

  let breadcrumbArray: Array<BreadcrumbItem> = [];

  breadcrumbArray.push({
    key: `${Types.Dialog}-${dialogId}`,
    label: dialogMap[dialogId]?.$designer?.name ?? dialogMap[dialogId]?.$designer?.$designer?.name,
    link: {
      projectId: projectId,
      dialogId: dialogId,
    },
    onClick: () => navTo(projectId, dialogId),
  });

  if (triggerIndex != null && trigger != null) {
    breadcrumbArray.push({
      key: `${Types.Trigger}-${triggerIndex}`,
      label: trigger.$designer?.name || getFriendlyName(trigger),
      link: {
        projectId: projectId,
        dialogId: dialogId,
        trigger: triggerIndex,
      },
      onClick: () => navTo(projectId, dialogId, `${triggerIndex}`),
    });
  }

  // getDialogData returns whatever's at the end of the path, which could be a trigger or an action
  const possibleAction = getDialogData(dialogMap, dialogId, focusPath);

  if (encodedFocused) {
    // we've linked to an action, so put that in too
    breadcrumbArray.push({
      key: `${Types.Action}-${focusPath}`,
      label: getActionName(possibleAction, pluginConfig),
    });
  }

  const currentDialog = (dialogs.find(({ id }) => id === dialogId) ?? dialogs[0]) as DialogInfo;

  // get newest label for breadcrumbs
  useEffect(() => {
    if (currentDialog.content) {
      breadcrumbArray = breadcrumbArray.map((b) => {
        const type = b.key.charAt(0);
        const name = b.key.substr(2);

        switch (type) {
          case Types.Dialog:
            b.label = getFriendlyName(currentDialog.content);
            break;
          case Types.Trigger:
            b.label = getFriendlyName(get(currentDialog.content, `triggers[${name}]`));
            break;
          case Types.Action:
            b.label = getActionName(get(currentDialog.content, name));
            break;
        }
        return b;
      });
    }
  }, [currentDialog?.content]);
  return breadcrumbArray;
};

const VisualEditorHeader: React.FC<VisualEditorHeaderProps> = (props) => {
  const { visible, showCode, projectId, onShowCodeClick, pluginConfig } = props;
  const breadcrumbs = useBreadcrumbs(projectId, pluginConfig);

  const createBreadcrumbItem: (breadcrumb: BreadcrumbItem) => IBreadcrumbItem = (breadcrumb: BreadcrumbItem) => {
    return {
      key: breadcrumb.key,
      text: breadcrumb.label,
      onClick: () => breadcrumb.onClick?.(),
    };
  };

  const items = breadcrumbs.map(createBreadcrumbItem);

  return visible ? (
    <div style={{ display: 'flex', justifyContent: 'space-between', height: '65px' }}>
      <Breadcrumb
        ariaLabel={formatMessage('Navigation Path')}
        data-testid="Breadcrumb"
        items={items}
        maxDisplayedItems={3}
        styles={breadcrumbClass}
        onReduceData={() => undefined}
      />
      <div style={{ padding: '10px' }}>
        <ActionButton onClick={onShowCodeClick}>
          {showCode ? formatMessage('Hide code') : formatMessage('Show code')}
        </ActionButton>
      </div>
    </div>
  ) : null;
};

export default VisualEditorHeader;
