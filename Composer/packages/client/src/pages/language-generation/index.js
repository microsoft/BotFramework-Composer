/** @jsx jsx */
import { jsx } from '@emotion/core';
import { debounce } from 'lodash';
import { useContext, Fragment, useEffect, useRef, useState, useMemo } from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { navigate } from '@reach/router';

import { Store } from '../../store/index';
import { ContentHeaderStyle, ContentStyle, flexContent, actionButton } from '../language-understanding/styles';

import '../language-understanding/style.css';
import Content from './content';

export const LGPage = props => {
<<<<<<< HEAD
=======
  let fileId = props.fileId;
>>>>>>> fix the bug on the back button and two other bugs which causes the white page bugs
  const { state, actions } = useContext(Store);
  const updateLgFile = useRef(debounce(actions.updateLgFile, 500)).current;
  const { lgFiles, dialogs } = state;
  const [textMode, setTextMode] = useState(false);
  const [newContent, setNewContent] = useState(null);

  const subPath = props['*'];

<<<<<<< HEAD
  const activePath = subPath === '' ? '_all' : subPath;
  const activeDialog = dialogs.find(item => item.name === subPath);

  // for now, one bot only have one lg file by default.
  // all dialog share one lg file.
  const lgFile = useMemo(() => {
    return lgFiles.length ? lgFiles[0] : null;
  }, [lgFiles]);

  const navLinks = useMemo(() => {
    const subLinks = dialogs.reduce((result, file) => {
      if (result.length === 0) {
        result = [{ links: [] }];
=======
  useEffect(() => {
    const lgCloneFiles = cloneDeep(lgFiles);
    let lgFile = lgCloneFiles.find(file => file.id === fileId);

    // if not found, redirect to first lg file
    if (lgCloneFiles.length !== 0 && lgFile === undefined) {
      lgFile = lgCloneFiles[0];
      if (fileId !== undefined) {
        navigate(`/language-generation/${lgFile.id}`);
      }
    }
    lgCloneFiles.forEach(file => {
      const parseResult = LGParser.TryParse(file.content);
      if (parseResult.isValid) {
        file.templates = parseResult.templates;
>>>>>>> fix the bug on the back button and two other bugs which causes the white page bugs
      }
      const item = {
        id: file.name,
        key: file.name,
        name: file.name,
      };

      if (file.id === 0) {
        result[0] = {
          ...result[0],
          ...item,
          isExpanded: true,
        };
      } else {
        result[0].links.push(item);
      }
      return result;
    }, []);

<<<<<<< HEAD
    return [
=======
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
          navigate(`/language-generation/${file.id}`);
        },
      };
    });
    setGroups([
>>>>>>> fix the bug on the back button and two other bugs which causes the white page bugs
      {
        links: [
          {
            id: '_all',
            key: '_all',
            name: 'All',
            isExpanded: true,
            links: subLinks,
          },
        ],
      },
<<<<<<< HEAD
    ];
  }, [dialogs]);

  // if dialog not find, navigate to all.
  useEffect(() => {
    if (!activeDialog && subPath && dialogs.length) {
      navigate('/language-generation');
    }
  });

  function onSelect(id) {
    if (id === '_all') {
      navigate(`/language-generation`);
    } else {
      navigate(`/language-generation/${id}`);
    }
  }
=======
    ]);
    setLgFile({ ...lgFile });
    setNewContent(null);
  }, [lgFiles, fileId]);
>>>>>>> fix the bug on the back button and two other bugs which causes the white page bugs

  function onChange(newContent) {
    setNewContent(newContent);
  }

  function discardChanges() {
    setLgFile({ ...lgFile });
    setNewContent(null);
  }

  function onSave() {
    const payload = {
      id: lgFile.id,
      content: newContent,
    };
    updateLgFile(payload);
  }

<<<<<<< HEAD
  //#TODO:
  // get line number from lg parser,
  // then deep link to code editor this Line
  function onTableViewWantEdit(template) {
    console.log(template);
    setTextMode(true);
  }

=======
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
    navigate(`/language-generation`);
  }

  async function onCreateLgFile(data) {
    await actions.createLgFile({
      id: data.name,
    });
    setModalOpen(false);
    navigate(`/language-generation/${data.name}`);
  }

  // performance optimization, component update should only trigger by lgFile change.
  const memoizedContent = useMemo(() => {
    return <Content file={lgFile} textMode={textMode} onChange={onChange} />;
  }, [lgFile, textMode]);

  if (lgFiles.length !== 0 && fileId === undefined) {
    fileId = lgFiles[0].id;
  }

>>>>>>> fix the bug on the back button and two other bugs which causes the white page bugs
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
            className={'toggleEditMode'}
            css={actionButton}
            onText="Edit mode"
            offText="Edit mode"
            checked={textMode}
            disabled={activePath !== '_all' && textMode === false}
            onChange={() => setTextMode(!textMode)}
          />
        </div>
      </div>
      <div css={ContentStyle} data-testid="LGEditor">
        <div>
          <Nav
            onLinkClick={(ev, item) => {
              onSelect(item.id);
              ev.preventDefault();
            }}
            selectedKey={activePath}
            groups={navLinks}
            className={'dialogNavTree'}
            data-testid={'dialogNavTree'}
          />
        </div>
        <Content
          file={lgFile}
          activeDialog={activeDialog}
          onEdit={onTableViewWantEdit}
          textMode={textMode}
          onChange={onChange}
        />
      </div>
    </Fragment>
  );
};
