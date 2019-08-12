/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext, useEffect, useMemo } from 'react';
import { Breadcrumb } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { globalHistory } from '@reach/router';

// import { getDialogData } from '../../utils';

import { TestController } from '../../TestController';
import { BASEPATH, DialogDeleting } from '../../constants';
import { getbreadcrumbLabel } from '../../utils';

import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import { ProjectTree } from './../../components/ProjectTree';
import { StoreContext } from './../../store';
import {
  breadcrumbClass,
  projectWrapper,
  projectContainer,
  projectHeader,
  projectTree,
  // assetTree,
  editorContainer,
  visualEditor,
  formEditor,
  editorWrapper,
  deleteDialogContent,
} from './styles';
import NewDialogModal from './new-dialog-modal';
import { MainContent } from './../../components/MainContent/index';
import { ToolBar } from './../../components/ToolBar/index';
import { OpenConfirmModal } from './../../components/Modal/Confirm';
import { DialogStyle } from './../../components/Modal/styles';
import { clearBreadcrumb, getUrlSearch } from './../../utils/navigation';

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
  const { dialogs, designPageLocation, breadcrumb, schemas } = state;
  const { removeDialog, setDesignPageLocation, navTo } = actions;
  const { location, match } = props;
  const { dialogId } = designPageLocation;

  useEffect(() => {
    if (match) {
      const { dialogId, uri } = match;
      const params = new URLSearchParams(location.search);
      setDesignPageLocation({
        dialogId: dialogId,
        uri: uri,
        focusedEvent: params.get('focusedEvent'),
        focusedSteps: params.getAll('focusedSteps[]'),
        breadcrumb: location.state ? location.state.breadcrumb || [] : [],
      });
    }
    globalHistory._onTransitionComplete();
  }, [location]);

  function handleFileClick(id) {
    navTo(id);
  }

  const getErrorMessage = name => {
    if (
      dialogs.findIndex(dialog => {
        return dialog.name === name;
      }) >= 0
    ) {
      return 'duplication of name';
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
      type: 'action',
      text: formatMessage('Add'),
      buttonProps: {
        iconProps: {
          iconName: 'CirclePlus',
        },
        onClick: () => actions.createDialogBegin(onCreateDialogComplete),
      },
      align: 'left',
    },
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  function handleBreadcrumbItemClick(_event, { dialogId, focusedEvent, focusedSteps, index }) {
    navTo(`${dialogId}${getUrlSearch(focusedEvent, focusedSteps)}`, clearBreadcrumb(breadcrumb, index));
  }

  const breadcrumbItems = useMemo(() => {
    const items =
      dialogs.length > 0
        ? breadcrumb.map((item, index) => {
            const { dialogId, focusedEvent, focusedSteps } = item;
            return {
              text: getbreadcrumbLabel(dialogs, dialogId, focusedEvent, focusedSteps, schemas),
              ...item,
              index,
              onClick: handleBreadcrumbItemClick,
            };
          })
        : [];
    return (
      <Breadcrumb
        items={items}
        ariaLabel={formatMessage('Navigation Path')}
        styles={breadcrumbClass}
        data-testid="Breadcrumb"
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

  return (
    <Fragment>
      {match && <ToolBar toolbarItems={toolbarItems} />}
      <MainContent>
        <Fragment>
          <div css={projectContainer}>
            <Tree variant="large" extraCss={projectTree}>
              <div css={projectWrapper}>
                <div css={projectHeader}>
                  <div>{formatMessage('Dialogs')}</div>
                </div>
                <ProjectTree
                  files={dialogs}
                  activeNode={dialogId || ''}
                  onSelect={handleFileClick}
                  onAdd={() => actions.createDialogBegin(onCreateDialogComplete)}
                  onDelete={handleDeleteDialog}
                />
              </div>
            </Tree>
          </div>
          <Conversation extraCss={editorContainer}>
            <Fragment>
              {breadcrumbItems}
              <div css={editorWrapper}>
                <iframe
                  key="VisualEditor"
                  name="VisualEditor"
                  css={visualEditor}
                  src={`${rootPath}/extensionContainer.html`}
                />
                <iframe
                  key="FormEditor"
                  name="FormEditor"
                  css={formEditor}
                  src={`${rootPath}/extensionContainer.html`}
                />
              </div>
            </Fragment>
          </Conversation>
        </Fragment>
      </MainContent>
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
