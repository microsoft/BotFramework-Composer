import React, { useEffect, Fragment, useContext } from 'react';

import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import { ProjectTree } from './../../components/ProjectTree';
import ApiClient from './../../messenger/ApiClient';
import { Store } from './../../store/index';

function DesignPage() {
  const { state, actions } = useContext(Store);
  const { files, openFileIndex, editors } = state;

  useEffect(() => {
    actions.fetchFiles();
  }, []);

  function handleFileClick(index) {
    // keep a ref because we want to read that from outside

    if (index === openFileIndex) {
      return;
    }

    actions.setOpenFileIndex(index);

    if (editors.length >= 1) {
      actions.resetVisualDesigner(ture);
    }

    actions.setEditor({
      col: 1,
      row: 1,
      data: files[index],
      name: 'window1',
      parent: 'window0', // shell
    });
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
              {editors.length > 0 &&
                editors.map(item => {
                  return (
                    <iframe
                      key={item.name}
                      name={item.name}
                      style={{ height: '100%', width: '100%', border: '0px' }}
                      src="/extensionContainer.html"
                    />
                  );
                })}
            </div>
          </Conversation>
        </div>
      </div>
    </Fragment>
  );
}

export default DesignPage;
