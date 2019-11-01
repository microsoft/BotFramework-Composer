// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActionButton, Breadcrumb, Icon, IBreadcrumbItem } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { globalHistory } from '@reach/router';
import { toLower, get } from 'lodash';
import { PromptTab } from '@bfc/shared';
import { getNewDesigner, seedNewDialog } from '@bfc/shared';

import { VisualEditorAPI } from '../../messenger/FrameAPI';
import { TestController } from '../../TestController';
import { BASEPATH, DialogDeleting } from '../../constants';
import { createSelectedPath, deleteTrigger, getbreadcrumbLabel } from '../../utils';
import { TriggerCreationModal } from '../../components/ProjectTree/TriggerCreationModal';
import { Conversation } from '../../components/Conversation';
import { DialogStyle } from '../../components/Modal/styles';
import { OpenConfirmModal } from '../../components/Modal/Confirm';
import { ProjectTree } from '../../components/ProjectTree';
import { StoreContext } from '../../store';
import { ToolBar } from '../../components/ToolBar/index';
import { clearBreadcrumb } from '../../utils/navigation';
import undoHistory from '../../store/middlewares/undo/history';
import grayComposerIcon from '../../images/grayComposerIcon.svg';

import NewDialogModal from './new-dialog-modal';
import {
  breadcrumbClass,
  contentWrapper,
  deleteDialogContent,
  editorContainer,
  editorWrapper,
  formEditor,
  middleTriggerContainer,
  middleTriggerElements,
  pageRoot,
  triggerButton,
  visualEditor,
  visualPanel,
} from './styles';

const addIconProps = {
  iconName: 'CircleAddition',
  styles: { root: { fontSize: '12px' } },
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
  return (
    <span>
      {!item.isRoot && <Icon iconName="Flow" styles={{ root: { marginLeft: '6px' } }} />}
      {render(item)}
    </span>
  );
}

function onRenderBlankVisual(isTriggerEmpty, onClickAddTrigger) {
  return (
    <div css={middleTriggerContainer}>
      <div css={middleTriggerElements}>
        {isTriggerEmpty ? (
          <Fragment>
            {formatMessage(`This dialog has no trigger yet.`)}
            <ActionButton
              data-testid="MiddleAddNewTriggerButton"
              iconProps={addIconProps}
              css={triggerButton}
              onClick={onClickAddTrigger}
            >
              {formatMessage('New Trigger ..')}
            </ActionButton>
          </Fragment>
        ) : (
          <div>
            <img alt={formatMessage('bot framework composer icon gray')} src={grayComposerIcon} />
            {formatMessage('Select a trigger on the left')} <br /> {formatMessage('navigation to see actions')}
          </div>
        )}
      </div>
    </div>
  );
}

function getAllRef(targetId, dialogs) {
  let refs: string[] = [];
  dialogs.forEach(dialog => {
    if (dialog.id === targetId) {
      refs = refs.concat(dialog.referredDialogs);
    } else if (!dialog.referredDialogs.every(item => item !== targetId)) {
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

const rootPath = BASEPATH.replace(/\/+$/g, '');

function DesignPage(props) {
  const { state, actions } = useContext(StoreContext);
  const { dialogs, designPageLocation, breadcrumb, visualEditorSelection } = state;
  const {
    removeDialog,
    setDesignPageLocation,
    navTo,
    selectTo,
    setectAndfocus,
    updateDialog,
    clearUndoHistory,
    onboardingAddCoachMarkRef,
  } = actions;
  const { location, match } = props;
  const { dialogId, selected } = designPageLocation;
  const [triggerModalVisible, setTriggerModalVisibility] = useState(false);
  const [triggerButtonVisible, setTriggerButtonVisibility] = useState(false);

  const addRef = useCallback(visualEditor => onboardingAddCoachMarkRef({ visualEditor }), []);

  useEffect(() => {
    if (match) {
      const { dialogId } = match;
      const params = new URLSearchParams(location.search);
      setDesignPageLocation({
        dialogId: dialogId,
        selected: params.get('selected'),
        focused: params.get('focused'),
        breadcrumb: location.state ? location.state.breadcrumb || [] : [],
        onBreadcrumbItemClick: handleBreadcrumbItemClick,
        promptTab: getTabFromFragment(),
      });
      // @ts-ignore
      globalHistory._onTransitionComplete();
    } else {
      //leave design page should clear the history
      clearUndoHistory();
    }
  }, [location]);

  useEffect(() => {
    const dialog = dialogs.find(d => d.id === dialogId);
    const visible = get(dialog, 'triggers', []).length === 0;
    setTriggerButtonVisibility(visible);
  }, [dialogs, dialogId]);

  const onTriggerCreationDismiss = () => {
    setTriggerModalVisibility(false);
  };

  const openNewTriggerModal = () => {
    setTriggerModalVisibility(true);
  };

  const onTriggerCreationSubmit = dialog => {
    const payload = {
      id: dialog.id,
      content: dialog.content,
    };
    const index = get(dialog, 'content.triggers', []).length - 1;
    actions.selectTo(`triggers[${index}]`);
    actions.updateDialog(payload);
  };

  function handleSelect(id, selected = '') {
    if (selected) {
      selectTo(selected);
    } else {
      navTo(id);
    }
  }

  const getErrorMessage = text => {
    if (
      dialogs.findIndex(dialog => {
        return toLower(dialog.id) === toLower(text);
      }) >= 0
    ) {
      return `${text} has been used, please choose another name`;
    }
    return '';
  };

  const onCreateDialogComplete = newDialog => {
    if (newDialog) {
      navTo(newDialog);
    }
  };

  const nodeOperationAvailable = Array.isArray(visualEditorSelection) && visualEditorSelection.length > 0;

  const toolbarItems = [
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
        ? breadcrumb.reduce(
            (result, item, index) => {
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
            },
            [] as IBreadcrumbItem[]
          )
        : [];
    return (
      <Breadcrumb
        items={items}
        ariaLabel={formatMessage('Navigation Path')}
        styles={breadcrumbClass}
        data-testid="Breadcrumb"
        onRenderItem={onRenderBreadcrumbItem}
      />
    );
  }, [dialogs, breadcrumb]);

  async function onSubmit(data) {
    const content = getNewDesigner(data.name, data.description);
    const seededContent = seedNewDialog('Microsoft.AdaptiveDialog', content.$designer, content);
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
        style: DialogStyle.Console,
      };
    } else {
      title = DialogDeleting.NO_LINKED_TITLE;
    }
    const result = await OpenConfirmModal(title, subTitle, setting);

    if (result) {
      await removeDialog(id);
    }
  }

  async function handleDeleteTrigger(id, index) {
    const content = deleteTrigger(dialogs, id, index);
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
          navTo(id);
        }
      } else if (index < currentIdx) {
        //if the deleted node is at the front, navTo the current one;
        selectTo(createSelectedPath(currentIdx - 1));
      }
    }
  }

  return (
    <Fragment>
      <div css={pageRoot}>
        <ProjectTree
          dialogs={dialogs}
          dialogId={dialogId}
          selected={selected}
          onSelect={handleSelect}
          onAdd={() => actions.createDialogBegin(onCreateDialogComplete)}
          onDeleteDialog={handleDeleteDialog}
          onDeleteTrigger={handleDeleteTrigger}
          openNewTriggerModal={openNewTriggerModal}
        />
        <div css={contentWrapper}>
          {match && <ToolBar toolbarItems={toolbarItems} />}
          <Conversation extraCss={editorContainer}>
            <Fragment>
              <div css={editorWrapper}>
                <div css={visualPanel}>
                  {breadcrumbItems}
                  <iframe
                    id="VisualEditor"
                    key="VisualEditor"
                    name="VisualEditor"
                    css={visualEditor}
                    hidden={triggerButtonVisible || !selected}
                    src={`${rootPath}/extensionContainer.html`}
                    ref={addRef}
                  />
                  {!selected && onRenderBlankVisual(triggerButtonVisible, openNewTriggerModal)}
                </div>
                <iframe
                  key="FormEditor"
                  name="FormEditor"
                  css={formEditor}
                  src={`${rootPath}/extensionContainer.html`}
                />
              </div>
            </Fragment>
          </Conversation>
        </div>
      </div>
      <NewDialogModal
        isOpen={state.showCreateDialogModal}
        onDismiss={() => actions.createDialogCancel()}
        onSubmit={onSubmit}
        onGetErrorMessage={getErrorMessage}
      />
      {triggerModalVisible && (
        <TriggerCreationModal
          dialogId={dialogId}
          isOpen={triggerModalVisible}
          onDismiss={onTriggerCreationDismiss}
          onSubmit={onTriggerCreationSubmit}
        />
      )}
    </Fragment>
  );
}

export default DesignPage;
