// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Suspense, useEffect, useMemo, useState, useCallback } from 'react';
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import formatMessage from 'format-message';
import { globalHistory, RouteComponentProps } from '@reach/router';
import get from 'lodash/get';
import { DialogInfo, PromptTab, getEditorAPI, registerEditorAPI } from '@bfc/shared';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { JsonEditor } from '@bfc/code-editor';
import { EditorExtension, PluginConfig } from '@bfc/extension-client';
import { useRecoilValue } from 'recoil';

import { LeftRightSplit } from '../../components/Split/LeftRightSplit';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TestController } from '../../components/TestController/TestController';
import { DialogDeleting } from '../../constants';
import { createSelectedPath, deleteTrigger, TriggerFormData, getDialogData } from '../../utils/dialogUtil';
import { Conversation } from '../../components/Conversation';
import { dialogStyle } from '../../components/Modal/dialogStyle';
import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { ProjectTree, TreeLink } from '../../components/ProjectTree/ProjectTree';
import { Toolbar, IToolbarItem } from '../../components/Toolbar';
import { getFocusPath } from '../../utils/navigation';
import { navigateTo } from '../../utils/navigation';
import { getFriendlyName } from '../../utils/dialogUtil';
import { useShell } from '../../shell';
import plugins, { mergePluginConfigs } from '../../plugins';
import { useElectronFeatures } from '../../hooks/useElectronFeatures';
import {
  visualEditorSelectionState,
  userSettingsState,
  dispatcherState,
  schemasState,
  displaySkillManifestState,
  validateDialogsSelectorFamily,
  focusPathState,
  showCreateDialogModalState,
  showAddSkillDialogModalState,
  localeState,
  rootBotProjectIdSelector,
  qnaFilesState,
} from '../../recoilModel';
import { CreateQnAModal } from '../../components/QnA';
import { triggerNotSupported } from '../../utils/dialogValidator';
import { undoFunctionState, undoVersionState } from '../../recoilModel/undo/history';
import { decodeDesignerPathToArrayPath } from '../../utils/convertUtils/designerPathEncoder';
import { useTriggerApi } from '../../shell/triggerApi';
import { undoStatusSelectorFamily } from '../../recoilModel/selectors/undo';

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

type BreadcrumbItem = {
  key: string;
  label: string;
  link?: Partial<TreeLink>;
  onClick?: () => void;
};

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

const parseTriggerId = (triggerId: string | undefined): number | undefined => {
  if (triggerId == null) return undefined;
  const indexString = triggerId.match(/\d+/)?.[0];
  if (indexString == null) return undefined;
  return parseInt(indexString);
};

const DesignPage: React.FC<RouteComponentProps<{ dialogId: string; projectId: string; skillId?: string }>> = (
  props
) => {
  const { location, dialogId, projectId = '', skillId = null } = props;
  const userSettings = useRecoilValue(userSettingsState);

  const qnaFiles = useRecoilValue(qnaFilesState(skillId ?? projectId));
  const schemas = useRecoilValue(schemasState(skillId ?? projectId));
  const dialogs = useRecoilValue(validateDialogsSelectorFamily(skillId ?? projectId));
  const displaySkillManifest = useRecoilValue(displaySkillManifestState(skillId ?? projectId));
  const focusPath = useRecoilValue(focusPathState(skillId ?? projectId));
  const showCreateDialogModal = useRecoilValue(showCreateDialogModalState(skillId ?? projectId));
  const showAddSkillDialogModal = useRecoilValue(showAddSkillDialogModalState(skillId ?? projectId));
  const locale = useRecoilValue(localeState(skillId ?? projectId));
  const undoFunction = useRecoilValue(undoFunctionState(skillId ?? projectId));
  const undoVersion = useRecoilValue(undoVersionState(skillId ?? projectId));
  const rootProjectId = useRecoilValue(rootBotProjectIdSelector) ?? projectId;

  const { undo, redo, commitChanges, clearUndo } = undoFunction;
  const [canUndo, canRedo] = useRecoilValue(undoStatusSelectorFamily(projectId));
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
    addSkillDialogCancel,
    exportToZip,
    onboardingAddCoachMarkRef,
    createQnAKBFromUrl,
    createQnAKBFromScratch,
    createQnAFromUrlDialogBegin,
    addSkill,
    updateZoomRate,
  } = useRecoilValue(dispatcherState);

  const params = new URLSearchParams(location?.search);
  const selected = decodeDesignerPathToArrayPath(
    dialogs.find((x) => x.id === props.dialogId)?.content,
    params.get('selected') || ''
  );
  const [triggerModalVisible, setTriggerModalVisibility] = useState(false);
  const [dialogJsonVisible, setDialogJsonVisibility] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<DialogInfo>(dialogs[0] as DialogInfo);
  const [exportSkillModalVisible, setExportSkillModalVisible] = useState(false);
  const [warningIsVisible, setWarningIsVisible] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<BreadcrumbItem>>([]);

  const shell = useShell('DesignPage', skillId ?? rootProjectId);
  const shellForFlowEditor = useShell('FlowEditor', skillId ?? rootProjectId);
  const shellForPropertyEditor = useShell('PropertyEditor', skillId ?? rootProjectId);
  const triggerApi = useTriggerApi(skillId ?? rootProjectId);
  const { createTrigger, createQnATrigger } = shell.api;

  useEffect(() => {
    const currentDialog = dialogs.find(({ id }) => id === dialogId) as DialogInfo | undefined;
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

    const dialogContent = currentDialog?.content ? Object.assign({}, currentDialog.content) : null;
    if (dialogContent !== null && !dialogContent.id) {
      dialogContent.id = dialogId;
      updateDialog({ id: dialogId, content: dialogContent, projectId });
    }
  }, [dialogId]);

  useEffect(() => {
    if (location && props.dialogId && props.projectId) {
      const { dialogId, projectId } = props;

      let { skillId } = props;
      if (skillId == null) skillId = projectId;

      const params = new URLSearchParams(location.search);
      const dialogMap = dialogs.reduce((acc, { content, id }) => ({ ...acc, [id]: content }), {});
      const dialogData = getDialogData(dialogMap, dialogId);
      const selected = decodeDesignerPathToArrayPath(dialogData, params.get('selected') ?? '');
      const focused = decodeDesignerPathToArrayPath(dialogData, params.get('focused') ?? '');

      // TODO: get these from a second return value from decodeDesignerPathToArrayPath
      const triggerIndex = parseTriggerId(selected);

      //make sure focusPath always valid
      const focusPath = getFocusPath(selected, focused);
      const trigger = triggerIndex != null && dialogData.triggers[triggerIndex];

      const breadcrumbArray: Array<BreadcrumbItem> = [];

      breadcrumbArray.push({
        key: 'dialog-' + props.dialogId,
        label: dialogMap[props.dialogId]?.$designer?.name ?? dialogMap[props.dialogId]?.$designer?.$designer?.name,
        link: {
          projectId: props.projectId,
          dialogId: props.dialogId,
        },
        onClick: () => navTo(projectId, dialogId),
      });
      if (triggerIndex != null && trigger != null) {
        breadcrumbArray.push({
          key: 'trigger-' + triggerIndex,
          label: trigger?.$designer?.name ?? getFriendlyName(trigger),
          link: {
            projectId: props.projectId,
            dialogId: props.dialogId,
            trigger: triggerIndex,
          },
          onClick: () => navTo(projectId, dialogId, `${triggerIndex}`),
        });
      }

      // getDialogData returns whatever's at the end of the path, which could be a trigger or an action
      const possibleAction = getDialogData(dialogMap, dialogId, focusPath);

      if (params.get('focused') != null) {
        // we've linked to an action, so put that in too
        breadcrumbArray.push({
          key: 'action-' + focusPath,
          label: getActionName(possibleAction),
        });
      }

      if (typeof possibleAction === 'undefined') {
        const { id: foundId } = dialogs.find(({ id }) => id === dialogId) || dialogs.find(({ isRoot }) => isRoot) || {};
        /**
         * It's improper to fallback to `dialogId` directly:
         *   - If 'action' does not exist at `focused` path, fallback to trigger path;
         *   - If 'trigger' does not exist at `selected` path, fallback to dialog Id;
         *   - If 'dialog' does not exist at `dialogId` path, fallback to main dialog.
         */
        if (foundId != null) {
          navTo(skillId ?? projectId, foundId);
        }
        return;
      }

      setDesignPageLocation(skillId ?? projectId, {
        dialogId,
        selected,
        focused,
        promptTab: getTabFromFragment(),
      });
      setBreadcrumbs(breadcrumbArray);
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

  const onTriggerCreationDismiss = () => {
    setTriggerModalVisibility(false);
  };

  const openNewTriggerModal = () => {
    setTriggerModalVisibility(true);
  };

  const onTriggerCreationSubmit = async (dialogId: string, formData: TriggerFormData) => {
    createTrigger(dialogId, formData);
  };

  function handleSelect(link: TreeLink) {
    const { skillId, dialogId, trigger, parentLink } = link;
    updateZoomRate({ currentRate: 1 });
    const breadcrumbArray: Array<BreadcrumbItem> = [];
    if (dialogId != null) {
      breadcrumbArray.push({
        key: 'dialog-' + parentLink?.dialogId,
        label: parentLink?.displayName ?? link.displayName,
        link: { projectId, skillId, dialogId },
        onClick: () => navTo(skillId ?? projectId, dialogId),
      });
    }
    if (trigger != null) {
      breadcrumbArray.push({
        key: 'trigger-' + parentLink?.trigger,
        label: link.displayName,
        link: { projectId, skillId, dialogId, trigger },
        onClick: () => selectTo(skillId ?? null, dialogId ?? null, `triggers[${trigger}]`),
      });
    }

    setBreadcrumbs(breadcrumbArray);

    if (trigger != null) {
      selectTo(skillId ?? null, dialogId ?? null, `triggers[${trigger}]`);
    } else if (dialogId != null) {
      navTo(skillId ?? projectId, dialogId);
    } else {
      // with no dialog or ID, we must be looking at a bot link
      navTo(skillId ?? projectId, null);
    }
  }

  const onCreateDialogComplete = (dialogId) => {
    if (dialogId) {
      navTo(projectId, dialogId);
    }
  };

  const pluginConfig: PluginConfig = useMemo(() => {
    const sdkUISchema = schemas?.ui?.content ?? {};
    const userUISchema = schemas?.uiOverrides?.content ?? {};
    return mergePluginConfigs({ uiSchema: sdkUISchema }, plugins, { uiSchema: userUISchema });
  }, [schemas?.ui?.content, schemas?.uiOverrides?.content]);

  const getActionName = (action) => {
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

  const { actionSelected, showDisableBtn, showEnableBtn } = useMemo(() => {
    const actionSelected = Array.isArray(visualEditorSelection) && visualEditorSelection.length > 0;
    if (!actionSelected) {
      return { actionSelected: false, showDisableBtn: false, showEnableBtn: false };
    }
    const selectedActions = visualEditorSelection.map((id) => get(currentDialog?.content, id));
    const showDisableBtn = selectedActions.some((x) => get(x, 'disabled') !== true);
    const showEnableBtn = selectedActions.some((x) => get(x, 'disabled') === true);

    if (selectedActions.length === 1 && selectedActions[0] != null) {
      const action = selectedActions[0] as any;
      const actionName = getActionName(action);

      setBreadcrumbs((prev) => [...prev.slice(0, 2), { key: 'action-' + actionName, label: actionName }]);
    }

    return { actionSelected, showDisableBtn, showEnableBtn };
  }, [visualEditorSelection, currentDialog?.content]);

  const { onFocusFlowEditor, onBlurFlowEditor } = useElectronFeatures(actionSelected, canUndo, canRedo);
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
              createQnAFromUrlDialogBegin({
                projectId,
              });
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
            disabled: !canUndo,
            onClick: undo,
          },
          {
            key: 'edit.redo',
            text: formatMessage('Redo'),
            disabled: !canRedo,
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

  const createBreadcrumbItem: (breadcrumb: BreadcrumbItem) => IBreadcrumbItem = (breadcrumb: BreadcrumbItem) => {
    return {
      key: breadcrumb.key,
      text: breadcrumb.label,
      onClick: () => breadcrumb.onClick?.(),
    };
  };

  const items = breadcrumbs.map(createBreadcrumbItem);

  const breadcrumbItems = (
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

  async function handleCreateDialogSubmit(dialogName, dialogData) {
    await createDialog({ id: dialogName, content: dialogData, projectId });
    commitChanges();
  }

  async function handleDeleteDialog(dialogId) {
    const refs = getAllRef(dialogId, dialogs);
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
      await removeDialog(dialogId, projectId);
      commitChanges();
    }
  }

  async function handleDeleteTrigger(dialogId: string, index: number) {
    const content = deleteTrigger(dialogs, dialogId, index, (trigger) => triggerApi.deleteTrigger(dialogId, trigger));

    if (content) {
      updateDialog({ id: dialogId, content, projectId: skillId ?? projectId });
      const match = /\[(\d+)\]/g.exec(selected);
      const current = match && match[1];
      if (!current) return;
      const currentIdx = parseInt(current);
      if (index === currentIdx) {
        if (currentIdx - 1 >= 0) {
          //if the deleted node is selected and the selected one is not the first one, navTo the previous trigger;
          selectTo(skillId ?? projectId, dialogId, createSelectedPath(currentIdx - 1));
        } else {
          //if the deleted node is selected and the selected one is the first one, navTo the first trigger;
          navTo(skillId ?? projectId, dialogId);
        }
      } else if (index < currentIdx) {
        //if the deleted node is at the front, navTo the current one;
        selectTo(skillId ?? projectId, dialogId, createSelectedPath(currentIdx - 1));
      }
    }
  }
  const addNewBtnRef = useCallback((addNew) => {
    onboardingAddCoachMarkRef({ addNew });
  }, []);

  const handleCreateQnA = async (data) => {
    if (!dialogId) return;
    createQnATrigger(dialogId);

    const { name, url, multiTurn } = data;
    if (url) {
      await createQnAKBFromUrl({ id: `${dialogId}.${locale}`, name, url, multiTurn, projectId });
    } else {
      await createQnAKBFromScratch({ id: `${dialogId}.${locale}`, name, projectId });
    }
  };

  if (!dialogId) {
    return <LoadingSpinner />;
  }

  const selectedTrigger = currentDialog?.triggers.find((t) => t.id === selected);
  const withWarning = triggerNotSupported(currentDialog, selectedTrigger);

  return (
    <React.Fragment>
      <div css={pageRoot}>
        <LeftRightSplit initialLeftGridWidth="20%" minLeftPixels={200} minRightPixels={800}>
          <ProjectTree
            defaultSelected={{
              projectId,
              skillId: skillId ?? undefined,
              dialogId,
              trigger: parseTriggerId(selectedTrigger?.id),
            }}
            onDeleteDialog={handleDeleteDialog}
            onDeleteTrigger={handleDeleteTrigger}
            onSelect={handleSelect}
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
                <LeftRightSplit initialLeftGridWidth="75%" minLeftPixels={500} minRightPixels={300}>
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
                          updateDialog({ id: currentDialog.id, content: data, projectId: skillId ?? projectId });
                        }}
                      />
                    ) : withWarning ? (
                      warningIsVisible && (
                        <WarningMessage
                          okText={formatMessage('Change Recognizer')}
                          onCancel={() => {
                            setWarningIsVisible(false);
                          }}
                          onOk={() => navigateTo(`/bot/${projectId}/dialogs/${dialogId}`)}
                        />
                      )
                    ) : (
                      <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shellForFlowEditor}>
                        <VisualEditor
                          openNewTriggerModal={openNewTriggerModal}
                          onBlur={() => onBlurFlowEditor()}
                          onFocus={() => onFocusFlowEditor()}
                        />
                      </EditorExtension>
                    )}
                  </div>
                  <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shellForPropertyEditor}>
                    <PropertyEditor key={focusPath + undoVersion} />
                  </EditorExtension>
                </LeftRightSplit>
              </div>
            </Conversation>
          </div>
        </LeftRightSplit>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        {showCreateDialogModal && (
          <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shell}>
            <CreateDialogModal
              isOpen={showCreateDialogModal}
              projectId={projectId}
              onDismiss={() => createDialogCancel(projectId)}
              onSubmit={handleCreateDialogSubmit}
            />
          </EditorExtension>
        )}
        {showAddSkillDialogModal && (
          <CreateSkillModal
            projectId={projectId}
            onDismiss={() => addSkillDialogCancel(projectId)}
            onSubmit={(skill) => addSkill(projectId, skill)}
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
        <CreateQnAModal dialogId={dialogId} projectId={projectId} qnaFiles={qnaFiles} onSubmit={handleCreateQnA} />
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
