// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import formatMessage from 'format-message';
import { globalHistory, RouteComponentProps } from '@reach/router';
import get from 'lodash/get';
import { DialogFactory, SDKKinds, DialogInfo, PromptTab, getEditorAPI, registerEditorAPI } from '@bfc/shared';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { JsonEditor } from '@bfc/code-editor';
import Extension, { useTriggerApi, PluginConfig } from '@bfc/extension';
import { useRecoilValue } from 'recoil';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TestController } from '../../components/TestController/TestController';
import { DialogDeleting } from '../../constants';
import {
  createSelectedPath,
  deleteTrigger,
  getBreadcrumbLabel,
  qnaMatcherKey,
  TriggerFormData,
  getDialogData,
} from '../../utils/dialogUtil';
import { Conversation } from '../../components/Conversation';
import { dialogStyle } from '../../components/Modal/dialogStyle';
import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { ProjectTree } from '../../components/ProjectTree/ProjectTree';
import { Toolbar, IToolbarItem } from '../../components/Toolbar';
import { clearBreadcrumb, getFocusPath } from '../../utils/navigation';
import { navigateTo } from '../../utils/navigation';
import { useShell } from '../../shell';
import plugins, { mergePluginConfigs } from '../../plugins';
import { useElectronFeatures } from '../../hooks/useElectronFeatures';
import {
  visualEditorSelectionState,
  userSettingsState,
  dispatcherState,
  schemasState,
  displaySkillManifestState,
  validateDialogSelectorFamily,
  breadcrumbState,
  focusPathState,
  showCreateDialogModalState,
  showAddSkillDialogModalState,
  skillsState,
  actionsSeedState,
  localeState,
  qnaFilesState,
} from '../../recoilModel';
import { getBaseName } from '../../utils/fileUtil';
import ImportQnAFromUrlModal from '../knowledge-base/ImportQnAFromUrlModal';
import { triggerNotSupported } from '../../utils/dialogValidator';
import { undoFunctionState } from '../../recoilModel/undo/history';

import { WarningMessage } from './WarningMessage';
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
  const { location, dialogId, projectId = '' } = props;
  const userSettings = useRecoilValue(userSettingsState);

  const schemas = useRecoilValue(schemasState(projectId));
  const dialogs = useRecoilValue(validateDialogSelectorFamily(projectId));
  const displaySkillManifest = useRecoilValue(displaySkillManifestState(projectId));
  const breadcrumb = useRecoilValue(breadcrumbState(projectId));
  const focusPath = useRecoilValue(focusPathState(projectId));
  const showCreateDialogModal = useRecoilValue(showCreateDialogModalState(projectId));
  const showAddSkillDialogModal = useRecoilValue(showAddSkillDialogModalState(projectId));
  const skills = useRecoilValue(skillsState(projectId));
  const actionsSeed = useRecoilValue(actionsSeedState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const undoVersion = useRecoilValue(undoFunctionState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesState(projectId));
  const undoFunction = useRecoilValue(undoFunctionState(projectId));
  const { undo, redo, canRedo, canUndo, commitChanges, clearUndo } = undoFunction;
  const visualEditorSelection = useRecoilValue(visualEditorSelectionState);
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
    createQnAFile,
    updateSkill,
    exportToZip,
    onboardingAddCoachMarkRef,
    importQnAFromUrls,
  } = useRecoilValue(dispatcherState);

  const params = new URLSearchParams(location?.search);
  const selected = params.get('selected') || '';
  const [triggerModalVisible, setTriggerModalVisibility] = useState(false);
  const [dialogJsonVisible, setDialogJsonVisibility] = useState(false);
  const [importQnAModalVisibility, setImportQnAModalVisibility] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<DialogInfo>(dialogs[0]);
  const [exportSkillModalVisible, setExportSkillModalVisible] = useState(false);
  const [warningIsVisible, setWarningIsVisible] = useState(true);
  const shell = useShell('DesignPage', projectId);
  const shellForFlowEditor = useShell('FlowEditor', projectId);
  const shellForPropertyEditor = useShell('PropertyEditor', projectId);
  const triggerApi = useTriggerApi(shell.api);
  const { createTrigger } = shell.api;

  useEffect(() => {
    const currentDialog = dialogs.find(({ id }) => id === dialogId);
    if (currentDialog) {
      setCurrentDialog(currentDialog);
    }
    const rootDialog = dialogs.find(({ isRoot }) => isRoot);
    if (!currentDialog && rootDialog) {
      const { search } = location || {};
      navigateTo(`/bot/${projectId}/dialogs/${rootDialog.id}${search}`);
      return;
    }
    setWarningIsVisible(true);
  }, [dialogId, dialogs, location]);

  // migration: add id to dialog when dialog doesn't have id
  useEffect(() => {
    const currentDialog = dialogs.find(({ id }) => id === dialogId);

    const dialogContent = currentDialog?.content ? Object.assign({}, currentDialog.content) : { emptyDialog: true };
    if (!dialogContent.emptyDialog && !dialogContent.id) {
      dialogContent.id = dialogId;
      updateDialog({ id: dialogId, content: dialogContent, projectId });
    }
  }, [dialogId]);

  // migration: add qna file for dialog
  useEffect(() => {
    dialogs.forEach(async (dialog) => {
      if (!qnaFiles || qnaFiles.length === 0 || !qnaFiles.find((qnaFile) => getBaseName(qnaFile.id) === dialog.id)) {
        await createQnAFile({ id: dialog.id, content: '', projectId });
      }
    });
  }, [dialogs]);

  useEffect(() => {
    if (location && props.dialogId && props.projectId) {
      const { dialogId, projectId } = props;
      const params = new URLSearchParams(location.search);
      const dialogMap = dialogs.reduce((acc, { content, id }) => ({ ...acc, [id]: content }), {});
      const selected = params.get('selected') ?? '';
      const focused = params.get('focused') ?? '';

      //make sure focusPath always valid
      const data = getDialogData(dialogMap, dialogId, getFocusPath(selected, focused));
      if (typeof data === 'undefined') {
        const { id } = dialogs.find(({ id }) => id === dialogId) || dialogs.find(({ isRoot }) => isRoot) || {};
        /**
         * It's improper to fallback to `dialogId` directly:
         *   - If 'action' not exists at `focused` path, fallback to trigger path;
         *   - If 'trigger' not exists at `selected` path, fallback to dialog Id;
         *   - If 'dialog' not exists at `dialogId` path, fallback to main dialog.
         */
        if (id) {
          navTo(projectId, id);
        }
        return;
      }

      setDesignPageLocation(projectId, {
        dialogId,
        selected,
        focused,
        breadcrumb: location.state?.breadcrumb || [],
        promptTab: getTabFromFragment(),
      });
      /* eslint-disable no-underscore-dangle */
      // @ts-ignore
      globalHistory._onTransitionComplete();
      /* eslint-enable */
    }
  }, [location]);

  useEffect(() => {
    registerEditorAPI('Editing', {
      Undo: () => undo(),
      Redo: () => redo(),
    });
    //leave design page should clear the history
    return clearUndo;
  }, []);

  const openImportQnAModal = () => {
    setImportQnAModalVisibility(true);
  };

  const onTriggerCreationDismiss = () => {
    setTriggerModalVisibility(false);
  };

  const openNewTriggerModal = () => {
    setTriggerModalVisibility(true);
  };

  const onTriggerCreationSubmit = async (dialogId: string, formData: TriggerFormData) => {
    createTrigger(dialogId, formData);
  };

  function handleSelect(projectId: string, dialogId: string | undefined, selected: string | undefined) {
    if (dialogId == null) {
      // maybe navigate to overall bot settings?
      return;
    } else if (selected != null) {
      selectTo(projectId, dialogId, selected);
    } else {
      navTo(projectId, dialogId, []);
    }
  }

  const onCreateDialogComplete = (newDialog) => {
    if (newDialog) {
      navTo(projectId, newDialog, []);
    }
  };

  const [flowEditorFocused, setFlowEditorFocused] = useState(false);
  const { actionSelected, showDisableBtn, showEnableBtn } = useMemo(() => {
    const actionSelected = Array.isArray(visualEditorSelection) && visualEditorSelection.length > 0;
    if (!actionSelected) {
      return { actionSelected: false, showDisableBtn: false, showEnableBtn: false };
    }
    const selectedActions = visualEditorSelection.map((id) => get(currentDialog?.content, id));
    const showDisableBtn = selectedActions.some((x) => get(x, 'disabled') !== true);
    const showEnableBtn = selectedActions.some((x) => get(x, 'disabled') === true);
    return { actionSelected, showDisableBtn, showEnableBtn };
  }, [visualEditorSelection]);

  useElectronFeatures(actionSelected, flowEditorFocused, canUndo(), canRedo());

  const EditorAPI = getEditorAPI();
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
              createDialogBegin([], onCreateDialogComplete, projectId);
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
          {
            'data-testid': 'AddNewKnowledgebase',
            key: 'addKnowledge',
            text: formatMessage(` Add new knowledge base on {displayName}`, {
              displayName: currentDialog?.displayName ?? '',
            }),
            onClick: () => {
              openImportQnAModal();
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
            disabled: !canUndo(),
            onClick: undo,
          },
          {
            key: 'edit.redo',
            text: formatMessage('Redo'),
            disabled: !canRedo(),
            onClick: redo,
          },
          {
            key: 'edit.cut',
            text: formatMessage('Cut'),
            disabled: !actionSelected,
            onClick: () => {
              EditorAPI.Actions.CutSelection();
            },
          },
          {
            key: 'edit.copy',
            text: formatMessage('Copy'),
            disabled: !actionSelected,
            onClick: () => {
              EditorAPI.Actions.CopySelection();
            },
          },
          {
            key: 'edit.move',
            text: formatMessage('Move'),
            disabled: !actionSelected,
            onClick: () => {
              EditorAPI.Actions.MoveSelection();
            },
          },
          {
            key: 'edit.delete',
            text: formatMessage('Delete'),
            disabled: !actionSelected,
            onClick: () => {
              EditorAPI.Actions.DeleteSelection();
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
              EditorAPI.Actions.DisableSelection();
            },
          },
          {
            key: 'enable',
            text: formatMessage('Enable'),
            disabled: !showEnableBtn,
            onClick: () => {
              EditorAPI.Actions.EnableSelection();
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
              exportToZip(projectId);
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
      element: <TestController projectId={projectId} />,
      align: 'right',
    },
  ];

  function handleBreadcrumbItemClick(_event, item) {
    if (item) {
      const { dialogId, selected, focused, index } = item;
      selectAndFocus(projectId, dialogId, selected, focused, clearBreadcrumb(breadcrumb, index));
    }
  }

  const breadcrumbItems = useMemo(() => {
    const items =
      dialogs.length > 0
        ? breadcrumb.reduce((result, item, index) => {
            const { dialogId, selected, focused } = item;
            const text = getBreadcrumbLabel(dialogs, dialogId, selected, focused);
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

  async function handleCreateDialogSubmit(data: { name: string; description: string }) {
    const seededContent = new DialogFactory(schemas.sdk?.content).create(SDKKinds.AdaptiveDialog, {
      $designer: { name: data.name, description: data.description },
      generator: `${data.name}.lg`,
      recognizer: `${data.name}.lu.qna`,
    });
    if (seededContent.triggers?.[0]) {
      seededContent.triggers[0].actions = actionsSeed;
    }
    await createDialog({ id: data.name, content: seededContent, projectId });
    commitChanges();
  }

  async function handleDeleteDialog(projectId, id) {
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
      commitChanges();
    }
  }

  async function handleDeleteTrigger(projectId, dialogId, index) {
    const content = deleteTrigger(dialogs, dialogId, index, (trigger) => triggerApi.deleteTrigger(dialogId, trigger));

    if (content) {
      updateDialog({ id: dialogId, content, projectId });
      const match = /\[(\d+)\]/g.exec(selected);
      const current = match && match[1];
      if (!current) return;
      const currentIdx = parseInt(current);
      if (index === currentIdx) {
        if (currentIdx - 1 >= 0) {
          //if the deleted node is selected and the selected one is not the first one, navTo the previous trigger;
          selectTo(projectId, dialogId, createSelectedPath(currentIdx - 1));
        } else {
          //if the deleted node is selected and the selected one is the first one, navTo the first trigger;
          navTo(projectId, dialogId, []);
        }
      } else if (index < currentIdx) {
        //if the deleted node is at the front, navTo the current one;
        selectTo(projectId, dialogId, createSelectedPath(currentIdx - 1));
      }
    }
  }

  async function handleDelete(link: { projectId: string; dialogName?: string; trigger?: number }) {
    const { projectId, dialogName, trigger } = link;
    if (trigger == null) {
      handleDeleteDialog(projectId, dialogName);
    } else {
      handleDeleteTrigger(projectId, dialogName, trigger);
    }
  }

  const addNewBtnRef = useCallback((addNew) => {
    onboardingAddCoachMarkRef({ addNew });
  }, []);

  const cancelImportQnAModal = () => {
    setImportQnAModalVisibility(false);
  };

  const handleCreateQnA = async (urls: string[]) => {
    cancelImportQnAModal();
    const formData = {
      $kind: qnaMatcherKey,
      errors: { $kind: '', intent: '', event: '', triggerPhrases: '', regEx: '', activity: '' },
      event: '',
      intent: '',
      regEx: '',
      triggerPhrases: '',
    };
    if (dialogId) {
      const url = `/bot/${projectId}/knowledge-base/${dialogId}`;
      createTrigger(dialogId, formData, url);
      // import qna from urls
      if (urls.length > 0) {
        await importQnAFromUrls({ id: `${dialogId}.${locale}`, urls, projectId });
      }
    }
  };

  const pluginConfig: PluginConfig = useMemo(() => {
    const sdkUISchema = schemas?.ui?.content ?? {};
    const userUISchema = schemas?.uiOverrides?.content ?? {};
    return mergePluginConfigs({ uiSchema: sdkUISchema }, plugins, { uiSchema: userUISchema });
  }, [schemas?.ui?.content, schemas?.uiOverrides?.content]);

  if (!dialogId) {
    return <LoadingSpinner />;
  }

  const selectedTrigger = currentDialog?.triggers.find((t) => t.id === selected);
  const withWarning = triggerNotSupported(currentDialog, selectedTrigger);

  return (
    <React.Fragment>
      <div css={pageRoot}>
        <ProjectTree
          dialogId={dialogId}
          selected={selected}
          onDelete={handleDelete}
          onSelect={(link) => {
            const { projectId, dialogName: dialogId, trigger: selected } = link;
            handleSelect(projectId, dialogId, selected == null ? '' : `triggers[${selected.toString()}]`);
          }}
        />
        <div css={contentWrapper} role="main">
          <div css={{ position: 'relative' }} data-testid="DesignPage-ToolBar">
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
                    key={'dialogjson'}
                    editorSettings={userSettings.codeEditor}
                    id={currentDialog.id}
                    schema={schemas.sdk.content}
                    value={currentDialog.content || undefined}
                    onChange={(data) => {
                      updateDialog({ id: currentDialog.id, content: data, projectId });
                    }}
                  />
                ) : withWarning ? (
                  warningIsVisible && (
                    <WarningMessage
                      okText={formatMessage('Change Recognizer')}
                      onCancel={() => {
                        setWarningIsVisible(false);
                      }}
                      onOk={() => navigateTo(`/bot/${projectId}/knowledge-base/all`)}
                    />
                  )
                ) : (
                  <Extension plugins={pluginConfig} projectId={projectId} shell={shellForFlowEditor}>
                    <VisualEditor
                      openNewTriggerModal={openNewTriggerModal}
                      onBlur={() => setFlowEditorFocused(false)}
                      onFocus={() => setFlowEditorFocused(true)}
                    />
                  </Extension>
                )}
              </div>
              <Extension plugins={pluginConfig} projectId={projectId} shell={shellForPropertyEditor}>
                <PropertyEditor key={focusPath + undoVersion} />
              </Extension>
            </div>
          </Conversation>
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        {showCreateDialogModal && (
          <CreateDialogModal
            isOpen={showCreateDialogModal}
            projectId={projectId}
            onDismiss={() => createDialogCancel(projectId)}
            onSubmit={handleCreateDialogSubmit}
          />
        )}
        {showAddSkillDialogModal && (
          <CreateSkillModal
            editIndex={-1}
            isOpen={showAddSkillDialogModal}
            projectId={projectId}
            skills={skills}
            onDismiss={() => addSkillDialogCancel(projectId)}
            onSubmit={handleAddSkillDialogSubmit}
          />
        )}
        {exportSkillModalVisible && (
          <ExportSkillModal
            isOpen={exportSkillModalVisible}
            projectId={projectId}
            onDismiss={() => setExportSkillModalVisible(false)}
            onSubmit={() => setExportSkillModalVisible(false)}
          />
        )}
        {triggerModalVisible && (
          <TriggerCreationModal
            dialogId={dialogId}
            isOpen={triggerModalVisible}
            projectId={projectId}
            onDismiss={onTriggerCreationDismiss}
            onSubmit={onTriggerCreationSubmit}
          />
        )}
        {importQnAModalVisibility && (
          <ImportQnAFromUrlModal dialogId={dialogId} onDismiss={cancelImportQnAModal} onSubmit={handleCreateQnA} />
        )}
        {displaySkillManifest && (
          <DisplayManifestModal
            manifestId={displaySkillManifest}
            projectId={projectId}
            onDismiss={() => dismissManifestModal(projectId)}
          />
        )}
      </Suspense>
    </React.Fragment>
  );
};

export default DesignPage;
