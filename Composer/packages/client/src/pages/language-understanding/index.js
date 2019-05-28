/** @jsx jsx */
import { jsx } from '@emotion/core';
import lodash from 'lodash';
import { useContext, useMemo, Fragment, useEffect, useRef, useState } from 'react';
import formatMessage from 'format-message';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { navigate } from '@reach/router';
import { ActionButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { Store } from '../../store/index';
import { OpenConfirmModal } from '../../components/Modal';

import { ContentHeaderStyle, ContentStyle, flexContent, actionButton } from './styles';
import NewLuFileModal from './create-new';
import Content from './content';

export const LUPage = props => {
  const fileId = props.fileId;
  const { state, actions } = useContext(Store);
  const updateLuFile = useRef(lodash.debounce(actions.updateLuFile, 500)).current;
  const { luFiles } = state;
  const [modalOpen, setModalOpen] = useState(false);
  const [textMode, setTextMode] = useState(true);
  const [contentChanged, setContentChanged] = useState(false);

  let changedNewContent = '';

  const [luFile, setLuFile] = useState(null);

  useEffect(() => {
    const luFile = luFiles.find(file => file.id === fileId);

    // if not found, redirect to first lu
    if (luFiles.length !== 0 && luFile === undefined) {
      navigate(`./${luFiles[0].id}`);
    }

    setLuFile({ ...luFile });

    setContentChanged(false);
  }, [luFiles, fileId]);

  function onChange(newContent) {
    changedNewContent = newContent;
    if (contentChanged === false) {
      setContentChanged(true);
    }
  }

  function discardChanges() {
    setLuFile({ ...luFile });
    setContentChanged(false);
  }

  function onSave() {
    const payload = {
      id: fileId,
      content: changedNewContent,
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
    navigate(`./`);
  }

  async function onCreateLuFile(data) {
    await actions.createLuFile(data);
    setModalOpen(false);
    navigate(`./${data.name}`);
  }

  const groups = useMemo(() => {
    const links = luFiles.map(file => {
      return {
        key: file.id,
        name: `${file.id}.lu`,
        collapseByDefault: false,
        ariaLabel: file.id,
        altText: file.id,
        title: file.id,
        isExpanded: true,
        links: [
          {
            name: `${file.id}Intent`,
            // url: `./${file.id}#ToDoIntent`,
          },
        ],
        forceAnchor: false,
        onClick: event => {
          event.preventDefault();
          navigate(`./${file.id}`);
        },
      };
    });
    return [
      {
        links: links,
      },
    ];
  }, [luFiles]);

  return (
    <Fragment>
      <div css={ContentHeaderStyle}>
        <div>Understanding what users say</div>
        <div css={flexContent}>
          {contentChanged && (
            <Fragment>
              <ActionButton iconProps={{ iconName: 'Save' }} split={true} onClick={() => onSave()}>
                Save file
              </ActionButton>
              <ActionButton iconProps={{ iconName: 'Undo' }} onClick={() => discardChanges()}>
                Discard changes
              </ActionButton>
            </Fragment>
          )}

          <ActionButton iconProps={{ iconName: 'Delete' }} onClick={() => onRemove()}>
            Delete file
          </ActionButton>
          <ActionButton iconProps={{ iconName: 'AddTo' }} onClick={() => setModalOpen(true)}>
            Add new LU file
          </ActionButton>
          <Toggle
            css={actionButton}
            checked={textMode}
            onText="Text editor"
            onChange={() => setTextMode(!textMode)}
            offText="Text editor"
          />
          <PrimaryButton data-automation-id="Publish" text="Publish to Luis" />
        </div>
      </div>
      <div css={ContentStyle}>
        <Nav
          styles={{
            root: {
              width: 255,
              height: 400,
              boxSizing: 'border-box',
              borderTop: '2px solid #41bdf4',
              fontWeight: 600,
              overflowY: 'auto',
            },
            linkText: { color: '#000' },
          }}
          selectedKey={fileId}
          expandButtonAriaLabel="Expand or collapse"
          groups={groups}
        />

        <Content file={luFile} textMode={textMode} onChange={onChange} />
      </div>
      <NewLuFileModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} onSubmit={onCreateLuFile} />
    </Fragment>
  );
};
