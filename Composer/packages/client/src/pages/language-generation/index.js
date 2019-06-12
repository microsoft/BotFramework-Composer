/** @jsx jsx */
import { jsx } from '@emotion/core';
import { debounce, cloneDeep } from 'lodash';
import { useContext, Fragment, useEffect, useRef, useState, useMemo } from 'react';
import formatMessage from 'format-message';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { navigate } from '@reach/router';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { LGParser } from 'botbuilder-lg';

import { Store } from '../../store/index';
import { OpenConfirmModal } from '../../components/Modal';
import { ContentHeaderStyle, ContentStyle, flexContent, actionButton } from '../language-understanding/styles';

import NewLgFileModal from './create-new';
import Content from './content';

export const LGPage = props => {
  const fileId = props.fileId;
  const { state, actions } = useContext(Store);
  const updateLgFile = useRef(debounce(actions.updateLgFile, 500)).current;
  const { lgFiles } = state;
  const [modalOpen, setModalOpen] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [newContent, setNewContent] = useState(null);
  const [groups, setGroups] = useState([]);

  const [lgFile, setLgFile] = useState(null);

  useEffect(() => {
    const lgCloneFiles = cloneDeep(lgFiles);
    const lgFile = lgCloneFiles.find(file => file.id === fileId);

    // if not found, redirect to first lg file
    if (lgCloneFiles.length !== 0 && lgFile === undefined) {
      navigate(`./${lgCloneFiles[0].id}`);
    }

    lgCloneFiles.forEach(file => {
      const parseResult = LGParser.TryParse(file.content);
      if (parseResult.isValid) {
        file.templates = parseResult.templates;
      }
    });

    const links = lgCloneFiles.map(file => {
      let subNav = [];

      // in case of unvalid LGParser templates
      if (Array.isArray(file.templates)) {
        subNav = file.templates.map(template => {
          return {
            name: template.Name,
          };
        });
      }

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
    setGroups([
      {
        links: links,
      },
    ]);

    setLgFile({ ...lgFile });

    setNewContent(null);
  }, [lgFiles, fileId]);

  function onChange(newContent) {
    setNewContent(newContent);
  }

  function discardChanges() {
    setLgFile({ ...lgFile });
    setNewContent(null);
  }

  function onSave() {
    const payload = {
      id: fileId,
      content: newContent,
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
    await actions.createLgFile({
      id: data.name,
    });
    setModalOpen(false);
    navigate(`./${data.name}`);
  }

  // performance optimization, component update should only trigger by lgFile change.
  const memoizedContent = useMemo(() => {
    return <Content file={lgFile} textMode={textMode} onChange={onChange} />;
  }, [lgFile, textMode]);

  return (
    <Fragment>
      <div css={ContentHeaderStyle}>
        <div>Language generation</div>
        <div css={flexContent}>
          {newContent && (
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
        </div>
      </div>
      <div css={ContentStyle} data-testid="LGEditor">
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

        {memoizedContent}
      </div>
      <NewLgFileModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} onSubmit={onCreateLgFile} />
    </Fragment>
  );
};
