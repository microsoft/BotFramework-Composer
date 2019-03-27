import Path from 'path';

import React, { Fragment, useContext } from 'react';

import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import { ProjectTree } from './../../components/ProjectTree';
import { Store } from './../../store/index';

function getDialogName(file) {
  return Path.basename(file.name, '.dialog');
}

function DesignPage() {
  const { state, actions } = useContext(Store);
  const { files, openFileIndex, navPath, focusPath } = state;

  function handleFileClick(index) {
    actions.setOpenFileIndex(index);
    actions.navTo(getDialogName(files[index]));
  }

  return (
    <Fragment>
      <div />
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, marginLeft: '30px', marginTop: '20px' }}>
          <div>
            <Tree variant="large">
              <div style={{ padding: '10px', color: '#4f4f4f' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Dialogs</div>
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
              {navPath === '' ? (
                ''
              ) : (
                <iframe
                  key="VisualEditor"
                  name="VisualEditor"
                  style={{ height: '100%', width: '100%', border: '0px' }}
                  src="/extensionContainer.html"
                />
              )}
              {focusPath === '' ? (
                ''
              ) : (
                <iframe
                  key="FormEditor"
                  name="FormEditor"
                  style={{ height: '100%', width: '100%', border: '0px' }}
                  src="/extensionContainer.html"
                />
              )}
            </div>
          </Conversation>
        </div>
      </div>
    </Fragment>
  );
}

export default DesignPage;
