import React, { Fragment, useContext, useEffect, useMemo } from 'react';
import { Breadcrumb, Icon } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { globalHistory } from '@reach/router';
import { toLower } from 'lodash';
import VisualDesigner from 'composer-extensions/visual-designer';
// import { getDialogData } from '../../utils';

import { TestController } from '../../TestController';
import { BASEPATH, DialogDeleting } from '../../constants';
import { getbreadcrumbLabel, getDialogsMap, getDialogData } from '../../utils';
import { addNewTrigger, deleteTrigger, createSelectedPath } from '../../utils';
import { shellApi } from '../../extension-container/ExtensionContainer';

import { Conversation } from './../../components/Conversation';
import { ProjectTree } from './../../components/ProjectTree';
import { StoreContext } from './../../store';
import {
  pageRoot,
  contentWrapper,
  breadcrumbClass,
  editorContainer,
  visualEditor,
  formEditor,
  editorWrapper,
  deleteDialogContent,
} from './styles';
import NewDialogModal from './new-dialog-modal';
import { ToolBar } from './../../components/ToolBar/index';
import { OpenConfirmModal } from './../../components/Modal/Confirm';
import { DialogStyle } from './../../components/Modal/styles';
import { clearBreadcrumb } from './../../utils/navigation';

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

function getAllRef(targetId, dialogs) {
  let refs = [];
  dialogs.forEach(dialog => {
    if (dialog.id === targetId) {
      refs = refs.concat(dialog.referredDialogs);
    } else if (!dialog.referredDialogs.every(item => item !== targetId)) {
      refs.push(dialog.displayName || dialog.id);
    }
  });
  return refs;
}

const rootPath = BASEPATH.replace(/\/+$/g, '');

function DesignPage(props) {
  const { state, actions } = useContext(StoreContext);
  const { dialogs, designPageLocation, breadcrumb } = state;
  const { removeDialog, setDesignPageLocation, navTo, selectTo, setectAndfocus, updateDialog } = actions;
  const { location, match } = props;
  const { dialogId, selected } = designPageLocation;

  const data = getDialogData(getDialogsMap(dialogs), designPageLocation.dialogId);

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
      });
      globalHistory._onTransitionComplete();
    }
  }, [location]);

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

  const toolbarItems = [
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  function handleBreadcrumbItemClick(_event, { dialogId, selected, focused, index }) {
    setectAndfocus(dialogId, selected, focused, clearBreadcrumb(breadcrumb, index));
  }

  const breadcrumbItems = useMemo(() => {
    const items =
      dialogs.length > 0
        ? breadcrumb.reduce((result, item, index) => {
            const { dialogId, selected, focused } = item;
            const text = getbreadcrumbLabel(dialogs, dialogId, selected, focused);
            if (text) {
              result.push({ text, isRoot: !selected && !focused, ...item, index, onClick: handleBreadcrumbItemClick });
            }
            return result;
          }, [])
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
    const content = {
      $designer: {
        name: data.name,
        description: data.description,
      },
    };
    await actions.createDialog({ id: data.name, content });
  }

  async function handleDeleteDialog(id) {
    const refs = getAllRef(id, dialogs);
    let setting = {
      confirmBtnText: formatMessage('Yes'),
      cancelBtnText: formatMessage('Cancel'),
    };
    let title = '';
    let subTitle = '';
    if (refs.length > 0) {
      title = DialogDeleting.TITLE;
      subTitle = `${refs.reduce((result, item) => `${result} ${item} \n`, '')}`;
      setting = {
        onRenderContent: onRenderContent,
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

  async function handleAddTrigger(id, type, index) {
    const content = addNewTrigger(dialogs, id, type);
    await updateDialog({ id, content });
    selectTo(createSelectedPath(index));
  }

  async function handleDeleteTrigger(id, index) {
    const content = deleteTrigger(dialogs, id, index);
    if (content) {
      await updateDialog({ id, content });
      let current = /\[(\d+)\]/g.exec(selected)[1];
      if (!current) return;
      current = parseInt(current);
      if (index === current) {
        if (current - 1 >= 0) {
          //if the deleted node is selected and the selected one is not the first one, navTo the previous trigger;
          selectTo(createSelectedPath(current - 1));
        } else {
          //if the deleted node is selected and the selected one is the first one, navTo the first trigger;
          navTo(id);
        }
      } else if (index < current) {
        //if the deleted node is at the front, navTo the current one;
        selectTo(createSelectedPath(current - 1));
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
          onAddTrigger={handleAddTrigger}
          onDeleteDialog={handleDeleteDialog}
          onDeleteTrigger={handleDeleteTrigger}
        />
        <div css={contentWrapper}>
          {match && <ToolBar toolbarItems={toolbarItems} />}
          <Conversation extraCss={editorContainer}>
            <Fragment>
              <div data-step="2" data-intro="This is your dialog path">
                {breadcrumbItems}
              </div>
              <div css={editorWrapper}>
                <div
                  id="VisualEditorIframe"
                  key="VisualEditor"
                  name="VisualEditor"
                  data-step="3"
                  data-intro="This is your step editor"
                  css={visualEditor}
                >
                  <VisualDesigner
                    data-test-id="VisualDesignerElm"
                    {...designPageLocation}
                    data={data}
                    shellApi={shellApi}
                    onChange={shellApi.saveData}
                  />
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
    </Fragment>
  );
}

export default DesignPage;
