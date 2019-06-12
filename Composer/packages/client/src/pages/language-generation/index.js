/** @jsx jsx */
import { jsx } from '@emotion/core';
import { debounce } from 'lodash';
import { useContext, Fragment, useEffect, useRef, useState, useMemo } from 'react';
import formatMessage from 'format-message';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { navigate } from '@reach/router';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { LGParser } from 'botbuilder-lg';
import { IconButton } from 'office-ui-fabric-react';

import { Store } from '../../store/index';
import { OpenConfirmModal } from '../../components/Modal';
import {
  ContentHeaderStyle,
  ContentStyle,
  flexContent,
  actionButton,
  navLinkText,
  navLinkBtns,
} from '../language-understanding/styles';

import '../language-understanding/style.css';
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
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const lgFile = lgFiles.find(file => file.id === fileId);

    // if not found, redirect to first lg file
    if (lgFiles.length !== 0 && lgFile === undefined) {
      navigate(`./${lgFiles[0].id}`);
    }

    // side nav links
    const links = lgFiles.map(file => {
      let subNav = [];
      const parseResult = LGParser.TryParse(file.content);

      if (parseResult.isValid) {
        subNav = parseResult.templates.map((template, templateIndex) => {
          return {
            name: template.Name,
            url: `#${template.Name}`,
            onClick: () => {
              setSelectedTemplate({
                fileId: file.id,
                index: templateIndex,
                name: template.Name,
              });
            },
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
        forceAnchor: true,
        file: file,
        links: subNav,
        onClick: event => {
          event.preventDefault();
          navigate(`./${file.id}`);
        },
      };
    });

    setGroups([
      {
        key: 'all',
        name: 'All',
        collapseByDefault: false,
        ariaLabel: 'all',
        altText: 'all',
        title: 'all',
        isExpanded: true,
        forceAnchor: true,
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

  async function onCopy(file) {
    const newfileId = `${file.id}.Copy`;
    await actions.createLgFile({
      id: newfileId,
      content: file.content,
    });

    navigate(`./${newfileId}`);
  }

  async function onRemove(file) {
    const fileId = file.id;
    const title = formatMessage(`Confirm delete ${fileId}.lg file?`);
    const confirm = await OpenConfirmModal(title);
    if (confirm === false) {
      return;
    }
    const payload = {
      id: fileId,
    };
    await actions.removeLgFile(payload);
    // navigate(`./all`);
  }

  async function onCreateLgFile(data) {
    await actions.createLgFile({
      id: data.name,
    });
    setModalOpen(false);
    navigate(`./${data.name}`);
  }

  function getNavAllMoreButtons() {
    return [
      {
        key: 'add',
        name: 'Add new LG file',
        onClick: () => {
          setModalOpen(true);
        },
      },
    ];
  }

  function getNavLinkMoreButtons(file) {
    return [
      {
        key: 'delete',
        name: 'Delete',
        onClick: () => {
          onRemove(file);
        },
      },
      {
        key: 'copy',
        name: 'Make a copy',
        onClick: () => {
          onCopy(file);
        },
      },
    ];
  }

  function onRenderNavLink(props, defaultRender) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div css={navLinkText}>{defaultRender(props)}</div>
        {Array.isArray(props.links) && (
          <div css={navLinkBtns}>
            <IconButton
              menuIconProps={{ iconName: 'More' }}
              menuProps={{
                shouldFocusOnMount: true,
                items: getNavLinkMoreButtons(props.file),
              }}
            />
          </div>
        )}
      </div>
    );
  }

  function onRenderNavGroupHeader(props, defaultRender) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div css={navLinkText}>{defaultRender(props)}</div>

        <div css={navLinkBtns}>
          <IconButton
            menuIconProps={{ iconName: 'More' }}
            menuProps={{
              shouldFocusOnMount: true,
              items: getNavAllMoreButtons(),
            }}
          />
        </div>
      </div>
    );
  }

  // performance optimization, component update should only trigger by lgFile change.
  const memoizedContent = useMemo(() => {
    return <Content file={lgFile} selectedTemplate={selectedTemplate} textMode={textMode} onChange={onChange} />;
  }, [lgFile, selectedTemplate, textMode]);

  return (
    <Fragment>
      <div css={ContentHeaderStyle}>
        <div>Bot says..</div>
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
          <Toggle
            css={actionButton}
            onText="Edit mode"
            offText="Edit mode"
            checked={textMode}
            onChange={() => setTextMode(!textMode)}
          />
        </div>
      </div>
      <div css={ContentStyle} data-testid="LGEditor">
        <Nav
          onRenderGroupHeader={onRenderNavGroupHeader}
          onRenderLink={onRenderNavLink}
          styles={{
            root: {
              width: 255,
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
