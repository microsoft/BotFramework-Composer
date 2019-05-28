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
import { ContentHeaderStyle, ContentStyle, flexContent, actionButton } from '../language-understanding/styles';

import NewLgFileModal from './create-new';
import Content from './content';

export const LGPage = props => {
  const fileId = props.fileId;
  const { state, actions } = useContext(Store);
  const updateLgFile = useRef(lodash.debounce(actions.updateLgFile, 500)).current;
  const { lgFiles } = state;
  const [modalOpen, setModalOpen] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [contentChanged, setContentChanged] = useState(false);

  let changedNewContent = '';

  const [lgFile, setLgFile] = useState(null);

  useEffect(() => {
    const lgFile = lgFiles.find(file => file.id === fileId);

    // if not found, redirect to first lg file
    if (lgFiles.length !== 0 && lgFile === undefined) {
      navigate(`./${lgFiles[0].id}`);
    }

    setLgFile({ ...lgFile });

    setContentChanged(false);
  }, [lgFiles, fileId]);

  function onChange(newContent) {
    changedNewContent = newContent;
    if (contentChanged === false) {
      setContentChanged(true);
    }
  }

  function discardChanges() {
    setLgFile({ ...lgFile });
    setContentChanged(false);
  }

  function onSave() {
    const payload = {
      id: fileId,
      content: changedNewContent,
    };
    updateLgFile(payload);
  }

  async function onRemove() {
    const title = formatMessage(`Confirm delete ${fileId}.lg file?`);
    const confirm = await OpenConfirmModal(title);
    if (confirm === false) {
      return;
    }
    const payload = {
      id: fileId,
    };
    await actions.removeLgFile(payload);
    navigate(`./`);
  }

  async function onCreateLgFile(data) {
    await actions.createLgFile(data);
    setModalOpen(false);
    navigate(`./${data.name}`);
  }

  const groups = useMemo(() => {
    const links = lgFiles.map(file => {
      const subNav = file.templates.map(template => {
        return {
          name: template.name,
        };
      });

      return {
        key: file.id,
        name: `${file.id}.lg`,
        collapseByDefault: false,
        ariaLabel: file.id,
        altText: file.id,
        title: file.id,
        isExpanded: true,
        links: subNav,
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
  }, [lgFiles]);

  return (
    <Fragment>
      <div css={ContentHeaderStyle}>
        <div>Language gereration</div>
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
            Add new LG file
          </ActionButton>
          <Toggle
            css={actionButton}
            onText="Text editor"
            offText="Text editor"
            checked={textMode}
            onChange={() => setTextMode(!textMode)}
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

        <Content file={lgFile} textMode={textMode} onChange={onChange} />
      </div>
      <NewLgFileModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} onSubmit={onCreateLgFile} />
    </Fragment>
  );
};
