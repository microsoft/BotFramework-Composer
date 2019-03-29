import Path from 'path';

import React, { Fragment, useContext, useState } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import { ProjectTree } from './../../components/ProjectTree';
import { Store } from './../../store/index';
import NewDialogModal from './NewDialogModal';

function getDialogName(file) {
  return Path.basename(file.name, '.dialog');
}

function DesignPage() {
  const { state, actions } = useContext(Store);
  const { files, openFileIndex, focusPath } = state;
  const [modalOpen, setModalOpen] = useState(false);

  function handleFileClick(index) {
    actions.setOpenFileIndex(index);
    actions.navTo(getDialogName(files[index]));
  }

  async function onSubmit(data) {
    await actions.createDialog(data);
    setModalOpen(false);
  }

  return (
    <Fragment>
      <div />
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginLeft: '30px', marginTop: '20px' }}>
          <div>
            <Tree variant="large">
              <div style={{ padding: '10px', color: '#4f4f4f' }}>
                <div
                  style={{
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>Dialogs</div>
                  <IconButton
                    iconProps={{ iconName: 'Add' }}
                    title="New Dialog"
                    ariaLabel="New Dialog"
                    onClick={() => setModalOpen(true)}
                  />
                </div>
                <ProjectTree files={files} activeNode={openFileIndex} onSelect={handleFileClick} />
              </div>
            </Tree>
            <div style={{ height: '20px' }} />
            <Tree />
          </div>
        </div>
        <div style={{ flex: 4, marginTop: '20px', marginLeft: '20px' }}>
          <Conversation>
            <div style={{ display: 'flex', flexDirection: 'row', height: '860px' }}>
              <iframe
                key="VisualEditor"
                name="VisualEditor"
                style={{ height: '100%', width: '100%', border: '0px' }}
                src="/extensionContainer.html"
              />
              <iframe
                key="FormEditor"
                name="FormEditor"
                style={{
                  height: '100%',
                  width: focusPath ? '100%' : '0%',
                  border: '0px',
                  transition: 'width 0.2s ease-in-out',
                }}
                src="/extensionContainer.html"
              />
            </div>
          </Conversation>
        </div>
      </div>
      <NewDialogModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} onSubmit={onSubmit} />
    </Fragment>
  );
}

export default DesignPage;
