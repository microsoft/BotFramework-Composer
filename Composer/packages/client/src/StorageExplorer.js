/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useContext } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import formatMessage from 'format-message';

import { OpenStatus } from './constants';
import { Store } from './store';
import { ActionSelector } from './components/StorageExplorer/ActionSelector';
import { body, content, panelContent, panelStyle, title } from './components/StorageExplorer/styles';
import { LocationSelectContent } from './components/StorageExplorer/LocationSelectContent';
import { NewContent } from './components/StorageExplorer/NewContent';
// this empty div tag is used to replace the default panel header.
function onRenderNavigationContent() {
  return <div style={{ height: '0px' }} />;
}

export function StorageExplorer() {
  const { state, actions } = useContext(Store);
  const { storageExplorerStatus } = state;
  const { setStorageExplorerStatus, closeCurrentProject, openBotProject, saveProjectAs, reloadBot } = actions;

  useEffect(() => {
    actions.fetchStorages();
  }, []);

  const closeExplorer = () => {
    setStorageExplorerStatus(OpenStatus.CLOSE);
  };

  const onLinkClick = (event, item) => {
    setStorageExplorerStatus(item.key);
  };

  const handleSaveAs = async (storageId, absolutePath) => {
    await saveProjectAs(storageId, absolutePath);
    closeExplorer();
  };

  const handleOpenBot = async (path, storageId) => {
    closeCurrentProject();
    await openBotProject(storageId, path);
    closeExplorer();
    reloadBot();
  };

  return (
    <Panel
      isOpen={storageExplorerStatus !== OpenStatus.CLOSE}
      type={PanelType.customNear}
      styles={panelStyle}
      isLightDismiss={true}
      hasCloseButton={false}
      onDismiss={closeExplorer}
      onRenderNavigation={onRenderNavigationContent}
    >
      <div css={body}>
        <ActionSelector selectedKey={storageExplorerStatus} onLinkClick={onLinkClick} onCloseExplorer={closeExplorer} />
        <div css={content}>
          <div css={title}>{formatMessage(storageExplorerStatus)}</div>
          <div css={panelContent}>
            {storageExplorerStatus === OpenStatus.NEW ? (
              <NewContent onCloseExplorer={closeExplorer} />
            ) : (
              <LocationSelectContent onSaveAs={handleSaveAs} onOpen={handleOpenBot} />
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
