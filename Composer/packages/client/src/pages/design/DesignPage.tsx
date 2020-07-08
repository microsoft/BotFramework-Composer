// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import formatMessage from 'format-message';
import { globalHistory, RouteComponentProps } from '@reach/router';
import get from 'lodash/get';
import { DialogFactory, SDKKinds, DialogInfo, PromptTab } from '@bfc/shared';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { JsonEditor } from '@bfc/code-editor';
import { useTriggerApi } from '@bfc/extension';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TestController } from '../../components/TestController/TestController';
import { DialogDeleting } from '../../constants';
import { createSelectedPath, deleteTrigger, getbreadcrumbLabel } from '../../utils/dialogUtil';
import { LuFilePayload } from '../../components/ProjectTree/TriggerCreationModal';
import { Conversation } from '../../components/Conversation';
import { dialogStyle } from '../../components/Modal/dialogStyle';
import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { ProjectTree } from '../../components/ProjectTree/ProjectTree';
import { ToolBar, IToolBarItem } from '../../components/ToolBar';
import { clearBreadcrumb } from '../../utils/navigation';
import undoHistory from '../../store/middlewares/undo/history';
import { navigateTo } from '../../utils/navigation';
import { useShell } from '../../shell';
import { useStoreContext } from '../../hooks/useStoreContext';

import { VisualEditorAPI } from './FrameAPI';
import {
  breadcrumbClass,
  contentWrapper,
  deleteDialogContent,
  editorContainer,
  editorWrapper,
  pageRoot,
  visualPanel,
} from './styles';
import { VisualEditor } from './VisualEditor';
import { PropertyEditor } from './PropertyEditor';

const CreateSkillModal = React.lazy(() => import('../../components/CreateSkillModal'));
const CreateDialogModal = React.lazy(() => import('./createDialogModal'));
const DisplayManifestModal = React.lazy(() => import('../../components/Modal/DisplayManifestModal'));
const ExportSkillModal = React.lazy(() => import('./exportSkillModal'));
const TriggerCreationModal = React.lazy(() => import('../../components/ProjectTree/TriggerCreationModal'));

function onRenderContent(subTitle, style) {
  return (
    <div css={deleteDialogContent}>
      <p>{DialogDeleting.CONTENT}</p>
      {subTitle && <div style={style}>{subTitle}</div>}
      <p>{DialogDeleting.CONFIRM_CONTENT}</p>
    </div>
  );
}

function onRenderBreadcrumbItem(item, render) {
  return <span>{render(item)}</span>;
}

function getAllRef(targetId, dialogs) {
  let refs: string[] = [];
  dialogs.forEach((dialog) => {
    if (dialog.id === targetId) {
      refs = refs.concat(dialog.referredDialogs);
    } else if (!dialog.referredDialogs.every((item) => item !== targetId)) {
      refs.push(dialog.displayName || dialog.id);
    }
  });
  return refs;
}

const getTabFromFragment = () => {
  const tab = window.location.hash.substring(1);

  if (Object.values<string>(PromptTab).includes(tab)) {
    return tab;
  }
};

const DesignPage: React.FC<RouteComponentProps<{ dialogId: string; projectId: string }>> = (props) => {
  const { state, actions } = useStoreContext();
  const {
    dialogs,
    displaySkillManifest,
    breadcrumb,
    visualEditorSelection,
    projectId,
    schemas,
    focusPath,
    designPageLocation,
    userSettings,
  } = state;
  const {
    dismissManifestModal,
    removeDialog,
    setDesignPageLocation,
    navTo,
    selectTo,
    setectAndfocus,
    updateDialog,
    clearUndoHistory,
  } = actions;
  const { location, dialogId } = props;
  const params = new URLSearchParams(location?.search);
  const selected = params.get('selected') || '';
  const [triggerModalVisible, setTriggerModalVisibility] = useState(false);
  const [dialogJsonVisible, setDialogJsonVisibility] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<DialogInfo>(dialogs[0]);
  const [exportSkillModalVisible, setExportSkillModalVisible] = useState(false);
  const shell = useShell('ProjectTree');
  const triggerApi = useTriggerApi(shell.api);

  useEffect(() => {
    const currentDialog = dialogs.find(({ id }) => id === dialogId);
    if (currentDialog) {
      setCurrentDialog(currentDialog);
    }
    const rootDialog = dialogs.find(({ isRoot }) => isRoot === true);
    if (!currentDialog && rootDialog) {
      const { search } = location || {};
      navigateTo(`/bot/${projectId}/dialogs/${rootDialog.id}${search}`);
      return;
    }
  }, [dialogId, dialogs, location]);

  useEffect(() => {
    const index = currentDialog.triggers.findIndex(({ type }) => type === SDKKinds.OnBeginDialog);
    if (index >= 0 && !designPageLocation.selected) {
      selectTo(createSelectedPath(index));
    }
  }, [currentDialog?.id]);

  useEffect(() => {
    if (location && props.dialogId && props.projectId) {
      const { dialogId, projectId } = props;
      const params = new URLSearchParams(location.search);
      setDesignPageLocation({
        dialogId: dialogId,
        projectId: projectId,
        selected: params.get('selected'),
        focused: params.get('focused'),
        breadcrumb: location.state ? location.state.breadcrumb || [] : [],
        onBreadcrumbItemClick: handleBreadcrumbItemClick,
        promptTab: getTabFromFragment(),
      });
      /* eslint-disable no-underscore-dangle */
      // @ts-ignore
      globalHistory._onTransitionComplete();
      /* eslint-enable */
    } else {
      //leave design page should clear the history
      clearUndoHistory();
    }
  }, [location]);

  const onTriggerCreationDismiss = () => {
    setTriggerModalVisibility(false);
  };

  const openNewTriggerModal = () => {
    setTriggerModalVisibility(true);
  };

  const onTriggerCreationSubmit = (dialog: DialogInfo, luFile?: LuFilePayload) => {
    const dialogPayload = {
      id: dialog.id,
      projectId,
      content: dialog.content,
    };
    if (luFile) {
      const luFilePayload = {
        id: luFile.id,
        content: luFile.content,
        projectId,
      };
      actions.updateLuFile(luFilePayload);
    }

    const index = get(dialog, 'content.triggers', []).length - 1;
    actions.selectTo(`triggers[${index}]`);
    actions.updateDialog(dialogPayload);
  };

  function handleSelect(id, selected = '') {
    if (selected) {
      selectTo(selected);
    } else {
      navTo(id);
    }
  }

  const onCreateDialogComplete = (newDialog) => {
    if (newDialog) {
      navTo(newDialog);
    }
  };

  const nodeOperationAvailable = Array.isArray(visualEditorSelection) && visualEditorSelection.length > 0;

  const toolbarItems: IToolBarItem[] = [
    {
      type: 'action',
      text: formatMessage('Undo'),
      buttonProps: {
        iconProps: {
          iconName: 'Undo',
        },
        onClick: () => actions.undo(),
      },
      align: 'left',
      disabled: !undoHistory.canUndo(),
    },
    {
      type: 'action',
      text: formatMessage('Redo'),
      buttonProps: {
        iconProps: {
          iconName: 'Redo',
        },
        onClick: () => actions.redo(),
      },
      align: 'left',
      disabled: !undoHistory.canRedo(),
    },
    {
      type: 'action',
      text: formatMessage('Cut'),
      buttonProps: {
        iconProps: {
          iconName: 'Cut',
        },
        onClick: () => VisualEditorAPI.cutSelection(),
      },
      align: 'left',
      disabled: !nodeOperationAvailable,
    },
    {
      type: 'action',
      text: formatMessage('Copy'),
      buttonProps: {
        iconProps: {
          iconName: 'Copy',
        },
        onClick: () => VisualEditorAPI.copySelection(),
      },
      align: 'left',
      disabled: !nodeOperationAvailable,
    },
    {
      type: 'action',
      text: formatMessage('Move'),
      buttonProps: {
        iconProps: {
          iconName: 'Share',
        },
        onClick: () => VisualEditorAPI.moveSelection(),
      },
      align: 'left',
      disabled: !nodeOperationAvailable,
    },
    {
      type: 'action',
      text: formatMessage('Delete'),
      buttonProps: {
        iconProps: {
          iconName: 'Delete',
        },
        onClick: () => VisualEditorAPI.deleteSelection(),
      },
      align: 'left',
      disabled: !nodeOperationAvailable,
    },
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  function handleBreadcrumbItemClick(_event, item) {
    if (item) {
      const { dialogId, selected, focused, index } = item;
      setectAndfocus(dialogId, selected, focused, clearBreadcrumb(breadcrumb, index));
    }
  }

  const breadcrumbItems = useMemo(() => {
    const items =
      dialogs.length > 0
        ? breadcrumb.reduce((result, item, index) => {
            const { dialogId, selected, focused } = item;
            const text = getbreadcrumbLabel(dialogs, dialogId, selected, focused);
            if (text) {
              result.push({
                // @ts-ignore
                index,
                isRoot: !selected && !focused,
                text,
                ...item,
                onClick: handleBreadcrumbItemClick,
              });
            }
            return result;
          }, [] as IBreadcrumbItem[])
        : [];
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', height: '65px' }}>
        <Breadcrumb
          ariaLabel={formatMessage('Navigation Path')}
          data-testid="Breadcrumb"
          items={items}
          maxDisplayedItems={3}
          styles={breadcrumbClass}
          onReduceData={() => undefined}
          onRenderItem={onRenderBreadcrumbItem}
        />
        <div style={{ padding: '10px' }}>
          <ActionButton
            onClick={() => {
              setDialogJsonVisibility((current) => !current);
            }}
          >
            {dialogJsonVisible ? formatMessage('Hide code') : formatMessage('Show code')}
          </ActionButton>
        </div>
      </div>
    );
  }, [dialogs, breadcrumb, dialogJsonVisible]);

  async function handleAddSkillDialogSubmit(skillData: { manifestUrl: string }) {
    await actions.updateSkill({ projectId, targetId: -1, skillData });
  }

  async function handleCreateDialogSubmit(data: { name: string; description: string }) {
    const seededContent = new DialogFactory(schemas.sdk?.content).create(SDKKinds.AdaptiveDialog, {
      $designer: { name: data.name, description: data.description },
      generator: `${data.name}.lg`,
    });
    if (seededContent.triggers?.[0]) {
      seededContent.triggers[0].actions = state.actionsSeed;
    }

    await actions.createDialog({ id: data.name, content: seededContent });
  }

  async function handleDeleteDialog(id) {
    const refs = getAllRef(id, dialogs);
    let setting: any = {
      confirmBtnText: formatMessage('Yes'),
      cancelBtnText: formatMessage('Cancel'),
    };
    let title = '';
    let subTitle = '';
    if (refs.length > 0) {
      title = DialogDeleting.TITLE;
      subTitle = `${refs.reduce((result, item) => `${result} ${item} \n`, '')}`;
      setting = {
        onRenderContent,
        style: dialogStyle.console,
      };
    } else {
      title = DialogDeleting.NO_LINKED_TITLE;
    }
    const result = await OpenConfirmModal(title, subTitle, setting);

    if (result) {
      await removeDialog(id, projectId);
    }
  }

  async function handleDeleteTrigger(id, index) {
    const content = deleteTrigger(dialogs, id, index, (trigger) => triggerApi.deleteTrigger(id, trigger));

    if (content) {
      await updateDialog({ id, projectId, content });
      const match = /\[(\d+)\]/g.exec(selected);
      const current = match && match[1];
      if (!current) return;
      const currentIdx = parseInt(current);
      if (index === currentIdx) {
        if (currentIdx - 1 >= 0) {
          //if the deleted node is selected and the selected one is not the first one, navTo the previous trigger;
          selectTo(createSelectedPath(currentIdx - 1));
        } else {
          //if the deleted node is selected and the selected one is the first one, navTo the first trigger;
          navTo(id);
        }
      } else if (index < currentIdx) {
        //if the deleted node is at the front, navTo the current one;
        selectTo(createSelectedPath(currentIdx - 1));
      }
    }
  }

  if (!dialogId) {
    return <LoadingSpinner />;
  }

  return (
    <React.Fragment>
      <div css={pageRoot}>
        <ProjectTree
          dialogId={dialogId}
          dialogs={dialogs}
          selected={selected}
          onDeleteDialog={handleDeleteDialog}
          onDeleteTrigger={handleDeleteTrigger}
          onSelect={handleSelect}
        />
        <div css={contentWrapper} role="main">
          <ToolBar
            currentDialog={currentDialog}
            openNewTriggerModal={openNewTriggerModal}
            showSkillManifestModal={() => setExportSkillModalVisible(true)}
            toolbarItems={toolbarItems}
            onCreateDialogComplete={onCreateDialogComplete}
          />
          <Conversation css={editorContainer}>
            <div css={editorWrapper}>
              <div aria-label={formatMessage('Authoring canvas')} css={visualPanel} role="region">
                {breadcrumbItems}
                {dialogJsonVisible ? (
                  <JsonEditor
                    key="dialogjson"
                    editorSettings={userSettings.codeEditor}
                    id={currentDialog.id}
                    schema={schemas.sdk.content}
                    value={currentDialog.content || undefined}
                    onChange={(data) => {
                      actions.updateDialog({ id: currentDialog.id, projectId, content: data });
                    }}
                  />
                ) : (
                  <VisualEditor openNewTriggerModal={openNewTriggerModal} />
                )}
              </div>
              <PropertyEditor key={focusPath} />
            </div>
          </Conversation>
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        {state.showCreateDialogModal && (
          <CreateDialogModal
            isOpen={state.showCreateDialogModal}
            onDismiss={() => actions.createDialogCancel()}
            onSubmit={handleCreateDialogSubmit}
          />
        )}
        {state.showAddSkillDialogModal && (
          <CreateSkillModal
            editIndex={-1}
            isOpen={state.showAddSkillDialogModal}
            projectId={projectId}
            skills={state.skills}
            onDismiss={() => actions.addSkillDialogCancel()}
            onSubmit={handleAddSkillDialogSubmit}
          />
        )}
        {exportSkillModalVisible && (
          <ExportSkillModal
            isOpen={exportSkillModalVisible}
            onDismiss={() => setExportSkillModalVisible(false)}
            onSubmit={() => setExportSkillModalVisible(false)}
          />
        )}
        {triggerModalVisible && (
          <TriggerCreationModal
            dialogId={dialogId}
            isOpen={triggerModalVisible}
            onDismiss={onTriggerCreationDismiss}
            onSubmit={onTriggerCreationSubmit}
          />
        )}
        {displaySkillManifest && (
          <DisplayManifestModal manifestId={displaySkillManifest} onDismiss={dismissManifestModal} />
        )}
      </Suspense>
    </React.Fragment>
  );
};

export default DesignPage;
