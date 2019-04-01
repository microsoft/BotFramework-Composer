import Path from 'path';

import React, { Fragment, useContext, useMemo } from 'react';
import { Breadcrumb } from 'office-ui-fabric-react/lib/Breadcrumb';

import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import { ProjectTree } from './../../components/ProjectTree';
import { Store } from './../../store/index';
import { breadcrumbClass } from './styles';

function getDialogName(file) {
  return Path.basename(file.name, '.dialog');
}

function DesignPage() {
  const { state, actions } = useContext(Store);
  const { files, openFileIndex, focusPath, navPathHistory } = state;
  const { setOpenFileIndex, clearNavHistory, navTo } = actions;

  function handleFileClick(index) {
    setOpenFileIndex(index);
    clearNavHistory();
    navTo(getDialogName(files[index]));
  }

  const breadcrumbItems = useMemo(() => {
    return navPathHistory.map((item, index) => ({
      key: item,
      index: index,
      text: item.substring(item.lastIndexOf('.') + 1, item.length),
      onClick: (_event, { key, index }) => {
        clearNavHistory(index);
        navTo(key);
      },
    }));
  }, [clearNavHistory, navPathHistory, navTo]);

  return (
    <Fragment>
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
            <div style={{ display: 'flex', flexDirection: 'column', height: '860px' }}>
              <Breadcrumb items={breadcrumbItems} ariaLabel={'Navigation Path'} styles={breadcrumbClass} />
              <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '1', height: '100%' }}>
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
            </div>
          </Conversation>
        </div>
      </div>
    </Fragment>
  );
}

export default DesignPage;
