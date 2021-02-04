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
import { DialogInfo, getFriendlyName } from '@bfc/shared';
import get from 'lodash/get';

import { TreeLink } from '../../components/ProjectTree/ProjectTree';
import { designPageLocationState, dialogsSelectorFamily, dispatcherState } from '../../recoilModel';
import { getDialogData } from '../../utils/dialogUtil';
import { decodeDesignerPathToArrayPath } from '../../utils/convertUtils/designerPathEncoder';
import { getFocusPath } from '../../utils/navigation';

import { breadcrumbClass } from './styles';

type BreadcrumbItem = {
  key: string;
  label: string;
  link?: Partial<TreeLink>;
  onClick?: () => void;
};

type VisualPanelHeaderProps = {
  projectId: string;
  visible: boolean;
  showCode: boolean;
  onShowCodeClick: () => void;
  pluginConfig?: PluginConfig;
};

// field types
const BreadcrumbKeyPrefix = {
  Dialog: 'D',
  Trigger: 'T',
  Action: 'A',
};

const buildKey = (prefix: string, name: string | number): string => {
  return `${prefix}-${name}`;
};

const parseKey = (key: string): { prefix: string; name: string } => {
  return { prefix: key.charAt(0), name: key.substr(2) };
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

  const initialBreadcrumbArray: Array<BreadcrumbItem> = [];

  initialBreadcrumbArray.push({
    key: buildKey(BreadcrumbKeyPrefix.Dialog, dialogId),
    label: dialogMap[dialogId]?.$designer?.name ?? dialogMap[dialogId]?.$designer?.$designer?.name,
    link: {
      projectId: projectId,
      dialogId: dialogId,
    },
    onClick: () => navTo(projectId, dialogId),
  });

  if (triggerIndex != null && trigger != null) {
    initialBreadcrumbArray.push({
      key: buildKey(BreadcrumbKeyPrefix.Trigger, triggerIndex),
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
    initialBreadcrumbArray.push({
      key: buildKey(BreadcrumbKeyPrefix.Action, focusPath),
      label: getActionName(possibleAction, pluginConfig),
    });
  }

  const currentDialog = (dialogs.find(({ id }) => id === dialogId) ?? dialogs[0]) as DialogInfo;

  // get newest label for breadcrumbs
  const breadcrumbArray = useMemo(() => {
    if (currentDialog.content) {
      initialBreadcrumbArray.map((b) => {
        const { prefix, name } = parseKey(b.key);

        switch (prefix) {
          case BreadcrumbKeyPrefix.Dialog:
            b.label = getFriendlyName(currentDialog.content);
            break;
          case BreadcrumbKeyPrefix.Trigger:
            b.label = getFriendlyName(get(currentDialog.content, `triggers[${name}]`));
            break;
          case BreadcrumbKeyPrefix.Action:
            b.label = getActionName(get(currentDialog.content, name));
            break;
        }
        return b;
      });
    }
    return initialBreadcrumbArray;
  }, [currentDialog?.content, initialBreadcrumbArray]);
  return breadcrumbArray;
};

const VisualPanelHeader: React.FC<VisualPanelHeaderProps> = React.memo((props) => {
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
});

export default VisualPanelHeader;
