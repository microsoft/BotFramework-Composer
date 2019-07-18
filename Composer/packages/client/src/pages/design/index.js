/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext, useState, useMemo, useEffect } from 'react';
import { Breadcrumb } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { getDialogData } from '../../utils';
import { TestController } from '../../TestController';
import { DialogDeleting } from '../../constants';

import dialogHistory from './../../utils/navigateUtil';
import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import { ProjectTree } from './../../components/ProjectTree';
import { Store } from './../../store/index';
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
import { upperCaseName } from './../../utils/fileUtil';
import { MainContent } from './../../components/MainContent/index';
import { ToolBar } from './../../components/ToolBar/index';
import { OpenConfirmModal } from './../../components/Modal/Confirm';
import { DialogStyle } from './../../components/Modal/styles';

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

function DesignPage(props) {
  const { state, actions } = useContext(Store);
  const { dialogs } = state;
  const { removeDialog } = actions;
  const [modalOpen, setModalOpen] = useState(false);
  const { match, location } = props;

  const { navHistory } = location.state ? location.state : {};

  useEffect(() => {
    dialogHistory.history._onTransitionComplete();
  }, [location]);

  function handleFileClick(id) {
    dialogHistory.navTo(`${id}#`);
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

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.id] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

  const toolbarItems = [
    {
      type: 'action',
      text: formatMessage('Add'),
      buttonProps: {
        iconProps: {
          iconName: 'CirclePlus',
        },
        onClick: () => setModalOpen(true),
      },
      align: 'left',
    },
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  const breadcrumbItems = useMemo(() => {
    const botName = dialogs.length && dialogs.find(d => d.isRoot).displayName;
    return navHistory
      ? navHistory.map((item, index) => {
          const pathList = item.split('#');
          const text = pathList[1] === '' ? pathList[0] : getDialogData(dialogsMap, `${item}.$type`);
          const isRoot = dialogs.findIndex(d => d.isRoot && d.id === text) >= 0;
          const displayText = isRoot ? botName : text;
          return {
            key: index,
            path: item,
            text: formatMessage(upperCaseName(displayText)),
            onClick: (_event, { path, key }) => {
              const navHistory = dialogHistory.clearNavHistory(key);
              dialogHistory.navTo(path, navHistory);
            },
          };
        })
      : [];
  }, [dialogs, navHistory]);

  const activeDialog = match ? match['*'].split('/')[0] : '';

  async function onSubmit(data) {
    const content = {
      $designer: {
        name: data.name,
        description: data.description,
      },
    };
    await actions.createDialog({ id: data.name, content });
    setModalOpen(false);
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
      {props.match && <ToolBar toolbarItems={toolbarItems} />}
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
                  activeNode={activeDialog}
                  onSelect={handleFileClick}
                  onAdd={() => setModalOpen(true)}
                  onDelete={handleDeleteDialog}
                />
              </div>
            </Tree>
          </div>
          <Conversation extraCss={editorContainer}>
            <Fragment>
              <Breadcrumb
                items={breadcrumbItems}
                ariaLabel={formatMessage('Navigation Path')}
                styles={breadcrumbClass}
                data-testid="Breadcrumb"
              />
              <div css={editorWrapper}>
                <iframe key="VisualEditor" name="VisualEditor" css={visualEditor} src="/extensionContainer.html" />
                <iframe key="FormEditor" name="FormEditor" css={formEditor} src="/extensionContainer.html" />
              </div>
            </Fragment>
          </Conversation>
        </Fragment>
      </MainContent>
      <NewDialogModal
        isOpen={modalOpen}
        onDismiss={() => setModalOpen(false)}
        onSubmit={onSubmit}
        onGetErrorMessage={getErrorMessage}
      />
    </Fragment>
  );
}

export default DesignPage;
