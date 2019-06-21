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
  const { state, actions } = useContext(Store);
  const updateLgFile = useRef(debounce(actions.updateLgFile, 500)).current;
  const { lgFiles, dialogs } = state;
  const [textMode, setTextMode] = useState(false);
  const [newContent, setNewContent] = useState(null);

  const subPath = props['*'];

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

    return [
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
    ];
  }, [dialogs]);

  // if dialog not find, navigate to all.
  useEffect(() => {
    if (!activeDialog && subPath && dialogs.length) {
      navigate('/language-generation');
    }

    setNewContent(null);
  }, [activePath, dialogs, lgFiles]);

  function onSelect(id) {
    if (id === '_all') {
      navigate(`/language-generation`);
    } else {
      navigate(`/language-generation/${id}`);
    }
  }

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

  //#TODO:
  // get line number from lg parser,
  // then deep link to code editor this Line
  function onTableViewWantEdit(template) {
    console.log(template);
    setTextMode(true);
  }

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
