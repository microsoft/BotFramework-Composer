/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext, useState, useMemo } from 'react';
import { Breadcrumb, IconButton } from 'office-ui-fabric-react';
import findindex from 'lodash.findindex';
import formatMessage from 'format-message';

import { getDialogData } from '../../utils';

import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import { ProjectTree } from './../../components/ProjectTree';
import { Store } from './../../store/index';
import {
  breadcrumbClass,
  contentContainer,
  projectWrapper,
  projectContainer,
  projectHeader,
  projectTree,
  assetTree,
  editorContainer,
  visualEditor,
  formEditor,
  editorWrapper,
} from './styles';
import NewDialogModal from './NewDialogModal';
import { upperCaseName } from './../../utils/fileUtil';

function DesignPage() {
  const { state, actions } = useContext(Store);
  const { dialogs, navPath, navPathHistory } = state;
  const { clearNavHistory, navTo } = actions;
  const [modalOpen, setModalOpen] = useState(false);

  function handleFileClick(index) {
    clearNavHistory();
    navTo(`${dialogs[index].name}#`);
  }

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.name] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

  const breadcrumbItems = useMemo(() => {
    return navPathHistory.map((item, index) => {
      const pathList = item.split('#');
      const text = pathList[1] === '' ? pathList[0] : getDialogData(dialogsMap, `${item}.$type`);

      return {
        key: index,
        path: item,
        text: formatMessage(upperCaseName(text)),
        onClick: (_event, { path, key }) => {
          clearNavHistory(key);
          navTo(path);
        },
      };
    });
  }, [clearNavHistory, dialogs, navPathHistory, navTo]);

  const activeDialog = useMemo(() => {
    if (!navPath) return -1;
    const dialogName = navPath.split('#')[0];
    return findindex(dialogs, { name: dialogName });
  }, [navPath]);

  async function onSubmit(data) {
    await actions.createDialog(data);
    setModalOpen(false);
  }

  return (
    <Fragment>
      <div css={contentContainer}>
        <div css={projectContainer}>
          <Tree variant="large" extraCss={projectTree}>
            <div css={projectWrapper}>
              <div css={projectHeader}>
                <div>{formatMessage('Dialogs')}</div>
                {dialogs.length > 0 ? (
                  <IconButton
                    iconProps={{ iconName: 'Add' }}
                    title={formatMessage('New Dialog')}
                    ariaLabel={formatMessage('New Dialog')}
                    onClick={() => setModalOpen(true)}
                  />
                ) : (
                  <div />
                )}
              </div>
              <ProjectTree files={dialogs} activeNode={activeDialog} onSelect={handleFileClick} />
            </div>
          </Tree>
          <div style={{ height: '20px' }} />
          <Tree extraCss={assetTree} />
        </div>
        <Conversation extraCss={editorContainer}>
          <Fragment>
            <Breadcrumb items={breadcrumbItems} ariaLabel={formatMessage('Navigation Path')} styles={breadcrumbClass} />
            <div css={editorWrapper}>
              <iframe key="VisualEditor" name="VisualEditor" css={visualEditor} src="/extensionContainer.html" />
              <iframe key="FormEditor" name="FormEditor" css={formEditor} src="/extensionContainer.html" />
            </div>
          </Fragment>
        </Conversation>
      </div>
      <NewDialogModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} onSubmit={onSubmit} />
    </Fragment>
  );
}

export default DesignPage;
