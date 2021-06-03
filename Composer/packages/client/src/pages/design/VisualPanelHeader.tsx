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

import { designPageLocationState, dialogsSelectorFamily, dispatcherState } from '../../recoilModel';
import { getDialogData } from '../../utils/dialogUtil';
import { decodeDesignerPathToArrayPath } from '../../utils/convertUtils/designerPathEncoder';
import { getFocusPath } from '../../utils/navigation';
import { TreeLink } from '../../components/ProjectTree/types';
import { useResizeObserver } from '../../hooks/useResizeObserver';

import * as pageStyles from './styles';

type BreadcrumbItem = {
  key: string;
  label: string;
  link?: Partial<TreeLink>;
  onClick?: () => void;
};

type VisualPanelHeaderProps = {
  projectId: string;
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
    const actionNameFromSchema = pluginConfig?.uiSchema?.[kind]?.form?.label;
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
  const trigger = triggerIndex != null && dialogData?.triggers[triggerIndex];

  const initialBreadcrumbArray: Array<BreadcrumbItem> = [];

  initialBreadcrumbArray.push({
    key: buildKey(BreadcrumbKeyPrefix.Dialog, dialogId),
    label: getFriendlyName(dialogMap[dialogId], true),
    link: {
      projectId: projectId,
      dialogId: dialogId,
    },
    onClick: () => navTo(projectId, dialogId),
  });

  if (triggerIndex != null && trigger != null) {
    initialBreadcrumbArray.push({
      key: buildKey(BreadcrumbKeyPrefix.Trigger, triggerIndex),
      label: getFriendlyName(trigger),
      link: {
        projectId: projectId,
        dialogId: dialogId,
        trigger: triggerIndex,
      },
      onClick: () => navTo(projectId, dialogId, `${triggerIndex}`),
    });
  }

  // getDialogData returns whatever is at the end of the path, which could be a trigger or an action
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
            b.label = getFriendlyName(currentDialog.content, true);
            break;
          case BreadcrumbKeyPrefix.Trigger:
            b.label = getFriendlyName(get(currentDialog.content, `triggers[${name}]`));
            break;
          case BreadcrumbKeyPrefix.Action:
            b.label = getActionName(get(currentDialog.content, name), pluginConfig);
            break;
        }
        return b;
      });
    }
    return initialBreadcrumbArray;
  }, [currentDialog?.content, initialBreadcrumbArray]);
  return breadcrumbArray;
};
const defaultToggleButtonWidth = 100;
const spaceBetweenContainers = 6;
const VisualPanelHeader: React.FC<VisualPanelHeaderProps> = React.memo((props) => {
  const { showCode, projectId, onShowCodeClick, pluginConfig } = props;

  const breadcrumbs = useBreadcrumbs(projectId, pluginConfig);

  const toggleButtonContainerRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [toggleButtonWidth, setToggleButtonWidth] = React.useState(defaultToggleButtonWidth);
  const [breadcrumbContainerWidth, setBreadcrumbContainerWidth] = React.useState<number | string>(
    `calc(100% - ${toggleButtonWidth}px)`
  );

  // Set the width of the toggle button based on its text (locale)
  React.useEffect(() => {
    if (toggleButtonContainerRef.current) {
      const toggleButton = toggleButtonContainerRef.current.querySelector<HTMLButtonElement>('button');
      if (toggleButton) {
        const { width } = toggleButton?.getBoundingClientRect();
        setToggleButtonWidth(width);
      }
    }
  }, []);

  // Observe width changes of the container to re-set the available width for breadcrumb container
  useResizeObserver<HTMLDivElement>(containerRef.current, (entries) => {
    if (entries.length) {
      const { width } = entries[0].contentRect;
      setBreadcrumbContainerWidth(width - toggleButtonWidth - spaceBetweenContainers);
    }
  });

  const createBreadcrumbItem: (breadcrumb: BreadcrumbItem) => IBreadcrumbItem = (breadcrumb: BreadcrumbItem) => {
    return {
      key: breadcrumb.key,
      text: breadcrumb.label,
      onClick: () => breadcrumb.onClick?.(),
    };
  };

  const items = breadcrumbs.map(createBreadcrumbItem);

  return (
    <div ref={containerRef} css={pageStyles.visualPanelHeaderContainer}>
      <div style={{ width: breadcrumbContainerWidth }}>
        <Breadcrumb
          ariaLabel={formatMessage('Navigation Path')}
          data-testid="Breadcrumb"
          items={items}
          styles={pageStyles.breadcrumbClass}
        />
      </div>
      <div ref={toggleButtonContainerRef} css={pageStyles.visualPanelHeaderShowCodeButton}>
        <ActionButton onClick={onShowCodeClick}>
          {showCode ? formatMessage('Hide code') : formatMessage('Show code')}
        </ActionButton>
      </div>
    </div>
  );
});

export default VisualPanelHeader;
