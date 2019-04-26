import React, { Fragment, useContext, useState, useMemo } from 'react';
import { Breadcrumb, IconButton } from 'office-ui-fabric-react';
import startCase from 'lodash.startcase';
import findindex from 'lodash.findindex';
import formatMessage from 'format-message';

import { getDialogData } from '../../utils';

import { Tree } from './../../components/Tree';
import { Conversation } from './../../components/Conversation';
import { ProjectTree } from './../../components/ProjectTree';
import { Store } from './../../store/index';
import { breadcrumbClass } from './styles';
import NewDialogModal from './NewDialogModal';

function DesignPage() {
  const { state, actions } = useContext(Store);
  const { dialogs, navPath, navPathHistory } = state;
  const { clearNavHistory, navTo } = actions;
  const [modalOpen, setModalOpen] = useState(false);

  function handleFileClick(index) {
    clearNavHistory();
    navTo(dialogs[index].name);
  }

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.name] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

  const breadcrumbItems = useMemo(() => {
    return navPathHistory.map((item, index) => {
      const text = item.indexOf('.') > -1 ? getDialogData(dialogsMap, `${item}.$type`) : item;

      return {
        key: index,
        path: item,
        text: formatMessage(startCase(text).replace(/\s/g, '')),
        onClick: (_event, { path, key }) => {
          clearNavHistory(key);
          navTo(path);
        },
      };
    });
  }, [clearNavHistory, dialogs, navPathHistory, navTo]);

  const activeDialog = useMemo(() => {
    if (!navPath) return -1;
    const dialogName = navPath.split('.')[0];
    return findindex(dialogs, { name: dialogName });
  }, [navPath]);

  async function onSubmit(data) {
    await actions.createDialog(data);
    setModalOpen(false);
  }

  return (
    <Fragment>
      <div style={{ display: 'flex' }}>
        <div style={{ flexGrow: '0', flexShrink: '0', width: '255px', marginLeft: '20px', marginTop: '20px' }}>
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
            <Tree />
          </div>
        </div>
        <div style={{ flexGrow: '4', marginTop: '20px', marginLeft: '20px', marginRight: '20px' }}>
          <Conversation>
            <div style={{ display: 'flex', flexDirection: 'column', height: '860px' }}>
              <Breadcrumb
                items={breadcrumbItems}
                ariaLabel={formatMessage('Navigation Path')}
                styles={breadcrumbClass}
              />
              <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '1', height: '100%' }}>
                <iframe
                  key="VisualEditor"
                  name="VisualEditor"
                  style={{ height: '100%', flex: 1, border: '0px' }}
                  src="/extensionContainer.html"
                />
                <iframe
                  key="FormEditor"
                  name="FormEditor"
                  style={{
                    height: '100%',
                    flex: 1,
                    // width: focusPath ? '100%' : '0%',
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
