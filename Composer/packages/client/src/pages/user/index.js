/** @jsx jsx */
import { jsx } from '@emotion/core';
import lodash from 'lodash';
import { Fragment, useContext, useRef, useState, useEffect } from 'react';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import formatMessage from 'format-message';
import { navigate } from '@reach/router';

import { Store } from '../../../store/index';
import { CommandBarStyle } from '../styles';
import { OpenConfirmModal } from '../../../components/Modal';
import CodeEditor from '../../../components/CodeEditor';

import NewLuFileModal from './create-new';

export function LanguageUnderstandingSettings(props) {
  const fileId = props.fileId;
  const { state, actions } = useContext(Store);
  const updateLuFile = useRef(lodash.debounce(actions.updateLuFile, 500)).current;
  const { luFiles } = state;
  const [modalOpen, setModalOpen] = useState(false);

  const [luFile, setLuFile] = useState(null);

  useEffect(() => {
    const luFile = luFiles.find(file => file.id === fileId);

    // if not found, redirect to first lu
    if (luFiles.length !== 0 && luFile === undefined) {
      navigate(`/content/lu/${luFiles[0].id}`);
    }

    setLuFile({ ...luFile });
  }, [luFiles, fileId]);

  function onSave(newContent) {
    const payload = {
      id: fileId,
      content: newContent,
    };
    updateLuFile(payload);
  }

  async function onRemove() {
    const title = formatMessage(`Confirm delete ${fileId}.lu file?`);
    const confirm = await OpenConfirmModal(title);
    if (confirm === false) {
      return;
    }
    const payload = {
      id: fileId,
    };
    await actions.removeLuFile(payload);
    navigate(`/content/lu/home`);
  }

  async function onCreateLuFile(data) {
    await actions.createLuFile(data);
    setModalOpen(false);
    navigate(`/content/lu/${data.name}`);
  }

  const CommandBarItems = [
    {
      key: 'Create',
      name: 'Create file',
      iconProps: {
        iconName: 'Add',
      },
      ariaLabel: 'Create',
      subMenuProps: {
        items: [
          {
            key: 'CreateEmpty',
            text: 'Create empty',
            iconProps: { iconName: 'Add' },
            onClick: () => setModalOpen(true),
          },
          {
            key: 'createFromTemplate',
            text: 'Create from template',
            iconProps: { iconName: 'Add' },
          },
          {
            key: 'importFromLius',
            text: 'Import from lius',
            iconProps: { iconName: 'Import' },
          },
        ],
      },
    },
    {
      key: 'Deploy',
      name: 'Deploy Luis',
      iconProps: {
        iconName: 'Deploy',
      },
      ariaLabel: 'Deploy',
      subMenuProps: {
        items: [
          {
            key: 'deployCurrentFile',
            name: 'Deploy current file',
            iconProps: { iconName: 'Deploy' },
          },
          {
            key: 'deployAllFile',
            name: 'Deploy all',
            iconProps: { iconName: 'Deploy' },
          },
        ],
      },
    },
  ];

  const CommandBarMoreItems = [
    {
      key: 'Delete',
      name: 'Delete file',
      iconProps: {
        iconName: 'Delete',
      },
      onClick: onRemove,
    },
  ];

  return luFile ? (
    <Fragment>
      <div>
        <CommandBar
          css={CommandBarStyle}
          items={CommandBarItems}
          overflowItems={CommandBarMoreItems}
          overflowButtonProps={{ ariaLabel: 'More commands' }}
          farItems={[]}
          ariaLabel={'Use left and right arrow keys to navigate between commands'}
        />
        <div style={{ marginTop: '-40px' }}>
          <CodeEditor value={luFile.content} mode={'markdown'} onSave={onSave} />
        </div>
      </div>

      <NewLuFileModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} onSubmit={onCreateLuFile} />
    </Fragment>
  ) : (
    <Fragment />
  );
}
