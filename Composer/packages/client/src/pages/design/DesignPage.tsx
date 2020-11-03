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
import { DialogDeleting } from '../../constants';
import {
  createSelectedPath,
  deleteTrigger as DialogdeleteTrigger,
  getBreadcrumbLabel,
  qnaMatcherKey,
  TriggerFormData,
  getDialogData,
} from '../../utils/dialogUtil';
import { Conversation } from '../../components/Conversation';
import { dialogStyle } from '../../components/Modal/dialogStyle';
import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { ProjectTree, TreeLink } from '../../components/ProjectTree/ProjectTree';
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
  validateDialogsSelectorFamily,
  breadcrumbState,
  focusPathState,
  localeState,
  qnaFilesState,
  skillsStateSelector,
  rootBotProjectIdSelector,
  projectDialogsMapSelector,
  skillIdByProjectIdSelector,
  SkillInfo,
} from '../../recoilModel';
import { CreateQnAModal } from '../../components/QnA';
import { triggerNotSupported } from '../../utils/dialogValidator';
import { undoFunctionState, undoVersionState } from '../../recoilModel/undo/history';
import { decodeDesignerPathToArrayPath } from '../../utils/convertUtils/designerPathEncoder';
import { CreationFlowStatus } from '../../constants';
import { RepairSkillModalOptionKeys } from '../../components/RepairSkillModal';
import { useLocalBotOperations } from '../../components/TestController/useLocalBotOperations';

import CreationModal from './creationModal';
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
import { ManifestEditor } from './ManifestEditor';

const CreateSkillModal = React.lazy(() => import('../../components/CreateSkillModal'));
const RepairSkillModal = React.lazy(() => import('../../components/RepairSkillModal'));
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

const DesignPage: React.FC<RouteComponentProps<{ dialogId: string; projectId: string; skillId?: string }>> = (
  props
) => {
  const { location, dialogId, projectId = '', skillId = null } = props;
  const userSettings = useRecoilValue(userSettingsState);

  const qnaFiles = useRecoilValue(qnaFilesState(skillId ?? projectId));
  const schemas = useRecoilValue(schemasState(skillId ?? projectId));
  const dialogs = useRecoilValue(validateDialogsSelectorFamily(skillId ?? projectId));
  const skills = useRecoilValue(skillsStateSelector);
  const displaySkillManifest = useRecoilValue(displaySkillManifestState(skillId ?? projectId));
  const skillsByProjectId = useRecoilValue(skillIdByProjectIdSelector);
  const projectDialogsMap = useRecoilValue(projectDialogsMapSelector);
  const { startSingleBot, stopSingleBot } = useLocalBotOperations();
  const breadcrumb = useRecoilValue(breadcrumbState(skillId ?? projectId));
  const focusPath = useRecoilValue(focusPathState(skillId ?? projectId));
  const locale = useRecoilValue(localeState(skillId ?? projectId));
  const undoFunction = useRecoilValue(undoFunctionState(skillId ?? projectId));
  const undoVersion = useRecoilValue(undoVersionState(skillId ?? projectId));
  const rootProjectId = useRecoilValue(rootBotProjectIdSelector) ?? projectId;
  const [showAddSkillDialogModal, setAddSkillDialogModalVisibility] = useState(false);
  const { undo, redo, canRedo, canUndo, commitChanges, clearUndo } = undoFunction;
  const visualEditorSelection = useRecoilValue(visualEditorSelectionState);
  const {
    removeDialog,
    updateDialog,
    createDialogBegin,
    createDialog,
    dismissManifestModal,
    setDesignPageLocation,
    navTo,
    selectTo,
    selectAndFocus,
    exportToZip,
    onboardingAddCoachMarkRef,
    addRemoteSkillToBotProject,
    setCreationFlowStatus,
    setCreationFlowTypes,
    removeSkillFromBotProject,
    updateZoomRate,
    createQnAKBFromUrl,
    createQnAKBFromScratch,
    createQnAFromUrlDialogBegin,
    setCurrentPageMode,
    createTrigger,
    deleteTrigger,
    displayManifestModal,
  } = useRecoilValue(dispatcherState);

  const params = new URLSearchParams(location?.search);
  const selected = decodeDesignerPathToArrayPath(
    dialogs.find((x) => x.id === props.dialogId)?.content,
    params.get('selected') || ''
  );

  const [triggerModalInfo, setTriggerModalInfo] = useState<undefined | { projectId: string; dialogId: string }>(
    undefined
  );
  const [dialogModalInfo, setDialogModalInfo] = useState<undefined | { projectId: string }>(undefined);
  const [exportSkillModalInfo, setExportSkillModalInfo] = useState<undefined | { projectId: string }>(undefined);
  const [skillManifestFile, setSkillManifestFile] = useState<undefined | SkillInfo>(undefined);
  const [brokenSkillInfo, setBrokenSkillInfo] = useState<undefined | TreeLink>(undefined);
  const [brokenSkillRepairCallback, setBrokenSkillRepairCallback] = useState<undefined | (() => void)>(undefined);
  const [dialogJsonVisible, setDialogJsonVisibility] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<DialogInfo>(dialogs[0]);
  const [warningIsVisible, setWarningIsVisible] = useState(true);
  const shell = useShell('DesignPage', skillId ?? projectId);
  const shellForFlowEditor = useShell('FlowEditor', skillId ?? projectId);
  const shellForPropertyEditor = useShell('PropertyEditor', skillId ?? projectId);

  const defaultQnATriggerData = {
    $kind: qnaMatcherKey,
    errors: { $kind: '', intent: '', event: '', triggerPhrases: '', regEx: '', activity: '' },
    event: '',
    intent: '',
    regEx: '',
    triggerPhrases: '',
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location?.search);
    const currentSkill = searchParams.get('skill-manifest');
    if (currentSkill) {
      setSkillManifestFile(skills[currentSkill]);
    }
  }, [location, skills]);

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

    const dialogContent = currentDialog?.content ? Object.assign({}, currentDialog.content) : null;
    if (dialogContent !== null && !dialogContent.id) {
      dialogContent.id = dialogId;
      updateDialog({ id: dialogId, content: dialogContent, projectId });
    }
  }, [dialogId]);

  useEffect(() => {
    setCurrentPageMode('design');
  }, []);

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

      //make sure focusPath always valid
      const data = getDialogData(dialogMap, dialogId, getFocusPath(selected, focused));

      if (typeof data === 'undefined') {
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

  const onTriggerCreationDismiss = () => {
    setTriggerModalInfo(undefined);
  };

  const openNewTriggerModal = (projectId: string, dialogId: string) => {
    setTriggerModalInfo({ projectId, dialogId });
  };

  function handleSelect(link: TreeLink) {
    if (link.bot?.error) {
      setBrokenSkillInfo(link);
    }
    updateZoomRate({ currentRate: 1 });
    if (link.trigger != null) {
      selectTo(link.skillId ?? null, link.dialogId ?? null, `triggers[${link.trigger}]`);
    } else if (link.dialogId != null) {
      navTo(link.skillId ?? link.projectId, link.dialogId, [
        { skillId: link.skillId, dialogId: link.dialogId, selected: '', focused: '' },
      ]);
    } else {
      // with no dialog or ID, we must be looking at a bot link
      navTo(link.skillId ?? link.projectId, null, []);
    }
  }

  const onCreateDialogComplete = (dialogId) => {
    if (dialogId) {
      navTo(projectId, dialogId, [{ dialogId, selected: '', focused: '' }]);
    }
  };

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

  const { onFocusFlowEditor, onBlurFlowEditor } = useElectronFeatures(actionSelected, canUndo?.(), canRedo?.());

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
              if (!projectId || !dialogId) return;
              openNewTriggerModal(projectId, dialogId);
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
                showFromScratch: true,
              });
            },
          },
          {
            'data-testid': 'CreateNewSkill',
            key: 'CreateNewSkill',
            text: formatMessage(' Create a new skill'),
            onClick: () => {
              setCreationFlowTypes('Skill');
              setCreationFlowStatus(CreationFlowStatus.NEW);
            },
          },
          {
            'data-testid': 'OpenSkill',
            key: 'OpenSkill',
            text: formatMessage(' Open a new skill'),
            onClick: () => {
              setCreationFlowTypes('Skill');
              setCreationFlowStatus(CreationFlowStatus.OPEN);
            },
          },
          {
            'data-testid': 'ConnectRemoteSkill',
            key: 'ConnectRemoteSkill',
            text: formatMessage(' Connect a remote skill'),
            onClick: () => {
              setAddSkillDialogModalVisibility(true);
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
            disabled: !canUndo?.(),
            onClick: undo,
          },
          {
            key: 'edit.redo',
            text: formatMessage('Redo'),
            disabled: !canRedo?.(),
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
              setExportSkillModalInfo({ projectId });
            },
          },
        ],
      },
    },
  ];

  function handleBreadcrumbItemClick(_event, item) {
    if (item) {
      const { dialogId, selected, focused, index } = item;
      selectAndFocus(projectId, skillId, dialogId, selected, focused, clearBreadcrumb(breadcrumb, index));
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

  async function handleCreateDialogSubmit(projectId, dialogName, dialogData) {
    setDialogModalInfo(undefined);
    await createDialog({ id: dialogName, content: dialogData, projectId });
    commitChanges();
  }

  async function handleDeleteDialog(projectId: string, dialogId: string) {
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

  async function handleDeleteTrigger(projectId: string, dialogId: string, index: number) {
    const content = DialogdeleteTrigger(
      projectDialogsMap[projectId],
      dialogId,
      index,
      async (trigger) => await deleteTrigger(projectId, dialogId, trigger)
    );

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
          navTo(skillId ?? projectId, dialogId, []);
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
    createTrigger(projectId, dialogId, defaultQnATriggerData);

    const { name, url, multiTurn } = data;
    if (url) {
      await createQnAKBFromUrl({ id: `${dialogId}.${locale}`, name, url, multiTurn, projectId });
    } else {
      await createQnAKBFromScratch({ id: `${dialogId}.${locale}`, name, projectId });
    }
  };

  const handleCreateDialog = (projectId: string) => {
    setDialogModalInfo({ projectId });
  };

  const handleDisplayManifestModal = (skillId: string) => {
    const skillNameIdentifier = skillsByProjectId[skillId];
    if (!skillNameIdentifier) return;
    displayManifestModal(skillNameIdentifier, projectId);
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

  const parseTriggerId = (triggerId: string | undefined): number | undefined => {
    if (triggerId == null) return undefined;
    const indexString = triggerId.match(/\d+/)?.[0];
    if (indexString == null) return undefined;
    return parseInt(indexString);
  };

  return (
    <React.Fragment>
      <div css={pageRoot}>
        <LeftRightSplit initialLeftGridWidth="20%" minLeftPixels={200} minRightPixels={800}>
          <ProjectTree
            onBotCreateDialog={handleCreateDialog}
            onBotDeleteDialog={handleDeleteDialog}
            onBotEditManifest={handleDisplayManifestModal}
            onBotExportZip={exportToZip}
            onBotRemoveSkill={removeSkillFromBotProject}
            onBotStart={startSingleBot}
            onBotStop={stopSingleBot}
            onDialogCreateTrigger={(projectId, dialogId) => {
              setTriggerModalInfo({ projectId, dialogId });
            }}
            onDialogDeleteTrigger={handleDeleteTrigger}
            defaultSelected={{
              projectId,
              skillId: skillId ?? undefined,
              dialogId,
              trigger: parseTriggerId(selectedTrigger?.id),
            }}
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
                          onOk={() => navigateTo(`/bot/${projectId}/knowledge-base/all`)}
                        />
                      )
                    ) : (
                      <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shellForFlowEditor}>
                        <VisualEditor
                          openNewTriggerModal={() => {
                            openNewTriggerModal(projectId, dialogId);
                          }}
                          onBlur={() => onBlurFlowEditor()}
                          onFocus={() => onFocusFlowEditor()}
                        />
                      </EditorExtension>
                    )}
                  </div>
                  <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shellForPropertyEditor}>
                    {skillManifestFile ? (
                      <ManifestEditor formData={skillManifestFile} />
                    ) : (
                      <PropertyEditor key={focusPath + undoVersion} />
                    )}
                  </EditorExtension>
                </LeftRightSplit>
              </div>
            </Conversation>
          </div>
        </LeftRightSplit>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        {dialogModalInfo && (
          <EditorExtension plugins={pluginConfig} projectId={dialogModalInfo.projectId} shell={shell}>
            <CreateDialogModal
              isOpen
              projectId={dialogModalInfo.projectId}
              onDismiss={() => setDialogModalInfo(undefined)}
              onSubmit={(dialogName, dialogData) => {
                handleCreateDialogSubmit(dialogModalInfo.projectId, dialogName, dialogData);
              }}
            />
          </EditorExtension>
        )}
        {showAddSkillDialogModal && (
          <CreateSkillModal
            projectId={projectId}
            onDismiss={() => {
              setAddSkillDialogModalVisibility(false);
            }}
            onSubmit={(manifestUrl, endpointName) => {
              setAddSkillDialogModalVisibility(false);
              addRemoteSkillToBotProject(manifestUrl, endpointName);
            }}
          />
        )}
        {exportSkillModalInfo && (
          <ExportSkillModal
            isOpen
            projectId={exportSkillModalInfo.projectId}
            onDismiss={() => setExportSkillModalInfo(undefined)}
            onSubmit={() => setExportSkillModalInfo(undefined)}
          />
        )}
        {triggerModalInfo && (
          <TriggerCreationModal
            isOpen
            dialogId={triggerModalInfo.dialogId}
            projectId={triggerModalInfo.projectId}
            onDismiss={onTriggerCreationDismiss}
            onSubmit={(dialogId, formData) => {
              createTrigger(triggerModalInfo.projectId, dialogId, formData);
            }}
          />
        )}
        <CreateQnAModal dialogId={dialogId} projectId={projectId} qnaFiles={qnaFiles} onSubmit={handleCreateQnA} />
        {displaySkillManifest && (
          <DisplayManifestModal
            projectId={projectId}
            skillNameIdentifier={displaySkillManifest}
            onDismiss={() => dismissManifestModal(projectId)}
          />
        )}
        {brokenSkillInfo && (
          <RepairSkillModal
            skillItem={brokenSkillInfo}
            onDismiss={() => {
              setBrokenSkillInfo(undefined);
            }}
            onNext={(option) => {
              const skillIdToRemove = brokenSkillInfo.skillId;
              if (!skillIdToRemove) return;

              if (option === RepairSkillModalOptionKeys.repairSkill) {
                setCreationFlowTypes('Skill');
                setCreationFlowStatus(CreationFlowStatus.OPEN);
                setBrokenSkillRepairCallback(() => {
                  removeSkillFromBotProject(skillIdToRemove);
                });
              } else if ((option = RepairSkillModalOptionKeys.removeSkill)) {
                removeSkillFromBotProject(skillIdToRemove);
              }
              setBrokenSkillInfo(undefined);
            }}
          ></RepairSkillModal>
        )}
        <CreationModal
          onDismiss={() => {}}
          onSubmit={() => {
            if (brokenSkillRepairCallback) {
              brokenSkillRepairCallback();
            }
          }}
        ></CreationModal>
      </Suspense>
    </React.Fragment>
  );
};

export default DesignPage;
