// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { SharedColors } from '@uifabric/fluent-theme';
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import formatMessage from 'format-message';
import { globalHistory, RouteComponentProps } from '@reach/router';
import get from 'lodash/get';
import { DialogFactory, SDKKinds, DialogInfo, PromptTab } from '@bfc/shared';
import { ActionButton, Button } from 'office-ui-fabric-react/lib/Button';
import { JsonEditor } from '@bfc/code-editor';
import { useTriggerApi } from '@bfc/extension';
import { useRecoilValue } from 'recoil';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TestController } from '../../components/TestController/TestController';
import { DialogDeleting } from '../../constants';
import { createSelectedPath, deleteTrigger, getbreadcrumbLabel } from '../../utils/dialogUtil';
import { LuFilePayload, LgFilePayload, QnAFilePayload } from '../../components/ProjectTree/TriggerCreationModal';
import { Conversation } from '../../components/Conversation';
import { dialogStyle } from '../../components/Modal/dialogStyle';
import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { ProjectTree } from '../../components/ProjectTree/ProjectTree';
import { undoHistory } from '../../recoilModel/undo';
import { Toolbar, IToolbarItem } from '../../components/Toolbar';
import { clearBreadcrumb } from '../../utils/navigation';
import { navigateTo } from '../../utils/navigation';
import { useShell } from '../../shell';
import { regexRecognizerKey, onChooseIntentKey, qnaMatcherKey } from '../../utils/dialogUtil';
import {
  dialogsState,
  projectIdState,
  schemasState,
  showCreateDialogModalState,
  dispatcherState,
  displaySkillManifestState,
  breadcrumbState,
  visualEditorSelectionState,
  focusPathState,
  designPageLocationState,
  showAddSkillDialogModalState,
  skillsState,
  actionsSeedState,
  userSettingsState,
} from '../../recoilModel';

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

const warningIcon = {
  marginLeft: 5,
  color: '#8A8780',
  fontSize: 20,
  cursor: 'pointer',
};

const warningRoot = {
  display: 'flex',
  background: '#FFF4CE',
  height: 50,
  alignItems: 'center',
};

const warningFont = {
  color: SharedColors.gray40,
  fontSize: 9,
  paddingLeft: 10,
};

const changeRecognizerButton = {
  root: {
    marginLeft: 200,
    border: '1px solid',
    borderRadius: 2,
    fontSize: 14,
  },
};

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
  const actions = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogsState);
  const projectId = useRecoilValue(projectIdState);
  const schemas = useRecoilValue(schemasState);
  const displaySkillManifest = useRecoilValue(displaySkillManifestState);
  const breadcrumb = useRecoilValue(breadcrumbState);
  const visualEditorSelection = useRecoilValue(visualEditorSelectionState);
  const focusPath = useRecoilValue(focusPathState);
  const designPageLocation = useRecoilValue(designPageLocationState);
  const showCreateDialogModal = useRecoilValue(showCreateDialogModalState);
  const showAddSkillDialogModal = useRecoilValue(showAddSkillDialogModalState);
  const skills = useRecoilValue(skillsState);
  const actionsSeed = useRecoilValue(actionsSeedState);
  const userSettings = useRecoilValue(userSettingsState);
  const {
    removeDialog,
    updateDialog,
    createDialogCancel,
    createDialogBegin,
    createDialog,
    dismissManifestModal,
    setDesignPageLocation,
    navTo,
    selectTo,
    selectAndFocus,
    addSkillDialogCancel,
    updateLuFile,
    updateLgFile,
    updateQnAFile,
    updateSkill,
    exportToZip,
    onboardingAddCoachMarkRef,
  } = useRecoilValue(dispatcherState);

  const { location, dialogId } = props;
  const params = new URLSearchParams(location?.search);
  const selected = params.get('selected') || '';
  const [triggerModalVisible, setTriggerModalVisibility] = useState(false);
  const [dialogJsonVisible, setDialogJsonVisibility] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<DialogInfo>(dialogs[0]);
  const [exportSkillModalVisible, setExportSkillModalVisible] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
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
    setShowWarning(true);

    // migration: add id to dialog when dialog doesn't have id
    const dialogContent = currentDialog?.content ? Object.assign({}, currentDialog.content) : { emptyDialog: true };
    if (!dialogContent.emptyDialog && !dialogContent.id) {
      dialogContent.id = dialogId;
      updateDialog({ id: dialogId, content: dialogContent });
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
        selected: params.get('selected') ?? '',
        focused: params.get('focused') ?? '',
        breadcrumb: location.state ? location.state.breadcrumb || [] : [],
        promptTab: getTabFromFragment(),
      });
      /* eslint-disable no-underscore-dangle */
      // @ts-ignore
      globalHistory._onTransitionComplete();
      /* eslint-enable */
    } else {
      //leave design page should clear the history
      // clearUndoHistory(); //TODO: undo/redo
    }
  }, [location]);

  const changeRecognizerComponent = useMemo(() => {
    return (
      <div css={warningRoot}>
        <Icon iconName={'Warning'} style={warningIcon} />
        <div css={warningFont}>
          {formatMessage(
            'This trigger type is not supported by the RegEx recognizer. To ensure this trigger is fired, change the recognizer type.'
          )}
        </div>
        <Button
          styles={changeRecognizerButton}
          text={formatMessage('Change Recognizer')}
          onClick={() => {
            actions.openRecognizerDropdown();
          }}
        />
        <Icon iconName={'Cancel'} style={warningIcon} onClick={() => setShowWarning(false)} />
      </div>
    );
  }, []);

  const onTriggerCreationDismiss = () => {
    setTriggerModalVisibility(false);
  };

  const openNewTriggerModal = () => {
    setTriggerModalVisibility(true);
  };

  const onTriggerCreationSubmit = async (
    dialog: DialogInfo,
    luFile?: LuFilePayload,
    lgFile?: LgFilePayload,
    qnaFile?: QnAFilePayload
  ) => {
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
      updateLuFile(luFilePayload);
    }

    if (lgFile) {
      const lgFilePayload = {
        id: lgFile.id,
        content: lgFile.content,
        projectId,
      };
      await updateLgFile(lgFilePayload);
    }

    if (qnaFile) {
      const qnaFilePayload = {
        id: qnaFile.id,
        content: qnaFile.content,
        projectId,
      };
      await updateQnAFile(qnaFilePayload);
    }

    const index = get(dialog, 'content.triggers', []).length - 1;
    selectTo(`triggers[${index}]`);
    updateDialog(dialogPayload);
  };

  function handleSelect(id, selected = '') {
    if (selected) {
      selectTo(selected);
    } else {
      navTo(id, []);
    }
  }

  const onCreateDialogComplete = (newDialog) => {
    if (newDialog) {
      navTo(newDialog, []);
    }
  };

  const { actionSelected, showDisableBtn, showEnableBtn } = useMemo(() => {
    const actionSelected = Array.isArray(visualEditorSelection) && visualEditorSelection.length > 0;
    if (!actionSelected) {
      return {};
    }
    const selectedActions = visualEditorSelection.map((id) => get(currentDialog?.content, id));
    const showDisableBtn = selectedActions.some((x) => get(x, 'disabled') !== true);
    const showEnableBtn = selectedActions.some((x) => get(x, 'disabled') === true);
    return { actionSelected, showDisableBtn, showEnableBtn };
  }, [visualEditorSelection]);

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'dropdown',
      text: formatMessage('Add'),
      align: 'left',
      dataTestid: 'AddFlyout',
      buttonProps: {
        iconProps: { iconName: 'Add' },
      },
      menuProps: {
        items: [
          {
            'data-testid': 'FlyoutNewDialog',
            key: 'adddialog',
            text: formatMessage('Add new dialog'),
            onClick: () => {
              createDialogBegin([], onCreateDialogComplete);
            },
          },
          {
            'data-testid': 'FlyoutNewTrigger',
            key: 'addtrigger',
            text: formatMessage(`Add new trigger on {displayName}`, {
              displayName: currentDialog?.displayName ?? '',
            }),
            onClick: () => {
              openNewTriggerModal();
            },
          },
        ],
      },
    },
    {
      type: 'dropdown',
      text: formatMessage('Edit'),
      align: 'left',
      dataTestid: 'EditFlyout',
      buttonProps: {
        iconProps: { iconName: 'Edit' },
      },
      menuProps: {
        items: [
          {
            key: 'edit.undo',
            text: formatMessage('Undo'),
            disabled: !undoHistory.canUndo(),
            onClick: () => {
              //ToDo undo
            },
          },
          {
            key: 'edit.redo',
            text: formatMessage('Redo'),
            disabled: !undoHistory.canRedo(),
            onClick: () => {
              //ToDo redo
            },
          },
          {
            key: 'edit.cut',
            text: formatMessage('Cut'),
            disabled: !actionSelected,
            onClick: () => {
              VisualEditorAPI.cutSelection();
            },
          },
          {
            key: 'edit.copy',
            text: formatMessage('Copy'),
            disabled: !actionSelected,
            onClick: () => {
              VisualEditorAPI.copySelection();
            },
          },
          {
            key: 'edit.move',
            text: formatMessage('Move'),
            disabled: !actionSelected,
            onClick: () => {
              VisualEditorAPI.moveSelection();
            },
          },
          {
            key: 'edit.delete',
            text: formatMessage('Delete'),
            disabled: !actionSelected,
            onClick: () => {
              VisualEditorAPI.deleteSelection();
            },
          },
        ],
      },
    },
    {
      type: 'dropdown',
      text: formatMessage('Disable'),
      align: 'left',
      disabled: !actionSelected,
      buttonProps: {
        iconProps: { iconName: 'RemoveOccurrence' },
      },
      menuProps: {
        items: [
          {
            key: 'disable',
            text: formatMessage('Disable'),
            disabled: !showDisableBtn,
            onClick: () => {
              VisualEditorAPI.disableSelection();
            },
          },
          {
            key: 'enable',
            text: formatMessage('Enable'),
            disabled: !showEnableBtn,
            onClick: () => {
              VisualEditorAPI.enableSelection();
            },
          },
        ],
      },
    },
    {
      type: 'dropdown',
      text: formatMessage('Export'),
      align: 'left',
      buttonProps: {
        iconProps: { iconName: 'OpenInNewWindow' },
      },
      menuProps: {
        items: [
          {
            key: 'zipexport',
            text: formatMessage('Export assets to .zip'),
            onClick: () => {
              exportToZip({ projectId });
            },
          },
          {
            key: 'exportAsSkill',
            text: formatMessage('Export as skill'),
            onClick: () => {
              setExportSkillModalVisible(true);
            },
          },
        ],
      },
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
      selectAndFocus(dialogId, selected, focused, clearBreadcrumb(breadcrumb, index));
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

  function handleAddSkillDialogSubmit(skillData: { manifestUrl: string }) {
    updateSkill({ projectId, targetId: -1, skillData });
  }

  function handleCreateDialogSubmit(data: { name: string; description: string }) {
    const seededContent = new DialogFactory(schemas.sdk?.content).create(SDKKinds.AdaptiveDialog, {
      $designer: { name: data.name, description: data.description },
      generator: `${data.name}.lg`,
      recognizer: `${data.name}.lu.qna`,
    });
    if (seededContent.triggers?.[0]) {
      seededContent.triggers[0].actions = actionsSeed;
    }
    createDialog({ id: data.name, content: seededContent });
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
      removeDialog(id);
    }
  }

  async function handleDeleteTrigger(id, index) {
    const content = deleteTrigger(dialogs, id, index, (trigger) => triggerApi.deleteTrigger(id, trigger));

    if (content) {
      await updateDialog({ id, content });
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
          navTo(id, []);
        }
      } else if (index < currentIdx) {
        //if the deleted node is at the front, navTo the current one;
        selectTo(createSelectedPath(currentIdx - 1));
      }
    }
  }
  const addNewBtnRef = useCallback((addNew) => {
    onboardingAddCoachMarkRef({ addNew });
  }, []);

  if (!dialogId) {
    return <LoadingSpinner />;
  }

  const isRegEx = (currentDialog.content?.recognizer?.$kind ?? '') === regexRecognizerKey;
  const selectedTrigger = currentDialog.triggers.find((t) => t.id === selected);
  const isNotSupported =
    isRegEx && (selectedTrigger?.type === qnaMatcherKey || selectedTrigger?.type === onChooseIntentKey);

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
          <div css={{ position: 'relative' }} data-testid="DesignPage-Toolbar">
            <span
              ref={addNewBtnRef}
              css={{ width: 120, height: '100%', position: 'absolute', left: 0, visibility: 'hidden' }}
              data-testid="CoachmarkRef-AddNew"
            />
            <Toolbar toolbarItems={toolbarItems} />
          </div>
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
                      updateDialog({ id: currentDialog.id, content: data });
                    }}
                  />
                ) : isNotSupported ? (
                  showWarning && changeRecognizerComponent
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
        {showCreateDialogModal && (
          <CreateDialogModal
            isOpen={showCreateDialogModal}
            onDismiss={createDialogCancel}
            onSubmit={handleCreateDialogSubmit}
          />
        )}
        {showAddSkillDialogModal && (
          <CreateSkillModal
            editIndex={-1}
            isOpen={showAddSkillDialogModal}
            projectId={projectId}
            skills={skills}
            onDismiss={() => addSkillDialogCancel()}
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
