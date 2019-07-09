/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext, useState, useMemo } from 'react';
import { Breadcrumb } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { getDialogData } from '../../utils';
import { TestController } from '../../TestController';
import { CreationFlowStatus } from '../../constants';

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
} from './styles';
import NewDialogModal from './new-dialog-modal';
import { upperCaseName } from './../../utils/fileUtil';
import { MainContent } from './../../components/MainContent/index';
import { ToolBar } from './../../components/ToolBar/index';

function DesignPage(props) {
  const { state, actions } = useContext(Store);
  const { dialogs, navPath, navPathHistory } = state;
  const { clearNavHistory, navTo, setCreationFlowStatus } = actions;
  const [modalOpen, setModalOpen] = useState(false);

  function handleFileClick(id) {
    clearNavHistory();
    navTo(`${id}#`);
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
      text: formatMessage('New'),
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        menuProps: {
          items: [
            {
              key: 'newBot',
              text: formatMessage('New Bot'),
              onClick: () => setCreationFlowStatus(CreationFlowStatus.NEW),
            },
            {
              key: 'newDialog',
              text: formatMessage('New Dialog'),
              onClick: () => setModalOpen(true),
            },
          ],
        },
      },
      align: 'left',
    },
    {
      type: 'action',
      text: formatMessage('Open'),
      buttonProps: {
        iconProps: {
          iconName: 'OpenFolderHorizontal',
        },
        onClick: () => setCreationFlowStatus(CreationFlowStatus.OPEN),
      },
      align: 'left',
    },
    {
      type: 'action',
      text: formatMessage('Save as'),
      buttonProps: {
        iconProps: {
          iconName: 'Save',
        },
        onClick: () => setCreationFlowStatus(CreationFlowStatus.SAVEAS),
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
    return navPathHistory.map((item, index) => {
      const pathList = item.split('#');
      const text = pathList[1] === '' ? pathList[0] : getDialogData(dialogsMap, `${item}.$type`);
      const isRoot = dialogs.findIndex(d => d.isRoot && d.id === text) >= 0;
      const displayText = isRoot ? botName : text;
      return {
        key: index,
        path: item,
        text: formatMessage(upperCaseName(displayText)),
        onClick: (_event, { path, key }) => {
          clearNavHistory(key);
          navTo(path);
        },
      };
    });
  }, [clearNavHistory, dialogs, navPathHistory, navTo]);

  const activeDialog = useMemo(() => {
    if (!navPath) return '';
    return navPath.split('#')[0];
  }, [navPath]);

  async function onSubmit(data) {
    await actions.createDialog(data);
    setModalOpen(false);
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
