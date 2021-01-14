// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
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
  const visualEditorSelection = useRecoilValue(visualEditorSelectionState);

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
    key: 'dialog-' + dialogId,
    label: dialogMap[dialogId]?.$designer?.name ?? dialogMap[dialogId]?.$designer?.$designer?.name,
    link: {
      projectId: projectId,
      dialogId: dialogId,
    },
    onClick: () => navTo(projectId, dialogId),
  });

  if (triggerIndex != null && trigger != null) {
    breadcrumbArray.push({
      key: 'trigger-' + triggerIndex,
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
      key: 'action-' + focusPath,
      label: getActionName(possibleAction, pluginConfig),
    });
  }

  const currentDialog = (dialogs.find(({ id }) => id === dialogId) ?? dialogs[0]) as DialogInfo;

  const selectedActions = useMemo(() => {
    const actionSelected = Array.isArray(visualEditorSelection) && visualEditorSelection.length > 0;
    if (!actionSelected) return [];

    const selectedActions = visualEditorSelection.map((id) => get(currentDialog?.content, id));

    return selectedActions;
  }, [visualEditorSelection, currentDialog?.content]);

  if (selectedActions.length === 1 && selectedActions[0] != null) {
    const action = selectedActions[0] as any;
    const actionName = getActionName(action, pluginConfig);

    breadcrumbArray = [...breadcrumbArray.slice(0, 2), { key: 'action-' + actionName, label: actionName }];
  }

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
