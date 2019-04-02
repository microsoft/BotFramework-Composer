import Path from 'path';

import React, { Fragment, useContext, useState, useMemo } from 'react';
import { Breadcrumb, IconButton } from 'office-ui-fabric-react';
import map from 'lodash.map';
import startCase from 'lodash.startcase';

import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import { ProjectTree } from './../../components/ProjectTree';
import { Store } from './../../store/index';
import { breadcrumbClass } from './styles';
import { getExtension, getBaseName } from './../../utils';
import NewDialogModal from './NewDialogModal';

function getDialogName(file) {
  return Path.basename(file.name, '.dialog');
}

function DesignPage() {
  const { state, actions } = useContext(Store);
  const { files, openFileIndex, focusPath, navPathHistory } = state;
  const { setOpenFileIndex, clearNavHistory, navTo } = actions;
  const [modalOpen, setModalOpen] = useState(false);

  function handleFileClick(index) {
    setOpenFileIndex(index);
    clearNavHistory();
    navTo(getDialogName(files[index]));
  }

  const breadcrumbItems = useMemo(() => {
    const dialogs = files.reduce(
      (result, item) => ({
        ...result,
        [getBaseName(item.name)]: item.content,
      }),
      {}
    );

    return navPathHistory.map((item, index) => {
      let text = item;
      if (item !== getBaseName(item)) {
        text = getExtension(map({ dialogs }, item + '.$type')[0]);
      }

      return {
        key: item + index,
        path: item,
        index: index,
        text: startCase(text).replace(/\s/g, ''),
        onClick: (_event, { path, index }) => {
          clearNavHistory(index);
          navTo(path);
        },
      };
    });
  }, [clearNavHistory, files, navPathHistory, navTo]);

  async function onSubmit(data) {
    await actions.createDialog(data);
    setModalOpen(false);
  }

  return (
    <Fragment>
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
                  {files.length > 0 ? (
                    <IconButton
                      iconProps={{ iconName: 'Add' }}
                      title="New Dialog"
                      ariaLabel="New Dialog"
                      onClick={() => setModalOpen(true)}
                    />
                  ) : (
                    <div />
                  )}
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
      <NewDialogModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} onSubmit={onSubmit} />
    </Fragment>
  );
}

export default DesignPage;
