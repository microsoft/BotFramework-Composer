/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, Fragment, useEffect, useState, useMemo } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { navigate } from '@reach/router';

import { BASEPATH } from '../../constants';
import { StoreContext } from '../../store';
import { resolveToBasePath } from '../../utils/fileUtil';
import {
  ContentHeaderStyle,
  ContentStyle,
  flexContent,
  actionButton,
  contentEditor,
} from '../language-understanding/styles';
import { projectContainer, projectTree, projectWrapper } from '../design/styles';

import CodeEditor from './code-editor';
import { Tree } from './../../components/Tree';
import '../language-understanding/style.css';
import TableView from './table-view';
import { ToolBar } from './../../components/ToolBar/index';
import { TestController } from './../../TestController';

const mapNavPath = x => resolveToBasePath(BASEPATH, x);

export const LUPage = props => {
  const { state, actions } = useContext(StoreContext);
  const { luFiles, dialogs } = state;
  const [editMode, setEditMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subPath = props['*'];
  const isRoot = subPath === '';
  const activeDialog = dialogs.find(item => item.id === subPath);

  const luFile = luFiles.length && activeDialog && luFiles.find(luFile => luFile.id === activeDialog.id);

  const navLinks = useMemo(() => {
    const subLinks = dialogs.reduce((result, file) => {
      if (result.length === 0) {
        result = [
          {
            links: [],
          },
        ];
      }
      const item = {
        id: file.id,
        key: file.id,
        name: file.displayName,
      };

      if (file.isRoot) {
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

  useEffect(() => {
    // if is root, disable editMode
    if (isRoot) {
      setEditMode(false);
    }

    //  if dialog not find, navigate to all
    if (!isRoot && !activeDialog && dialogs.length) {
      navigate(mapNavPath('/language-understanding'));
    }
  }, [subPath, dialogs]);

  useEffect(() => {
    setErrorMsg('');
  }, [luFile]);

  function onSelect(id) {
    if (id === '_all') {
      navigate(mapNavPath('/language-understanding'));
    } else {
      navigate(mapNavPath(`/language-understanding/${id}`));
    }
  }

  async function onChange(newContent) {
    const payload = {
      id: activeDialog.id, // current opened lu file
      content: newContent,
    };
    try {
      await actions.updateLuFile(payload);
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

  // #TODO: get line number from lu parser, then deep link to code editor this
  // Line
  function onTableViewWantEdit({ fileId = '' }) {
    navigate(mapNavPath(`language-understanding/${fileId}`));
    setEditMode(true);
  }

  const toolbarItems = [
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  return (
    <Fragment>
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <div>{formatMessage('User says')}..</div>
        <div css={flexContent}>
          <Toggle
            className={'toggleEditMode'}
            css={actionButton}
            onText={formatMessage('Edit mode')}
            offText={formatMessage('Edit mode')}
            checked={editMode}
            disabled={isRoot && editMode === false}
            onChange={() => setEditMode(!editMode)}
          />
        </div>
      </div>
      <div css={ContentStyle} data-testid="LUEditor">
        <div css={projectContainer}>
          <Tree variant="large" extraCss={projectTree}>
            <div css={projectWrapper}>
              <Nav
                onLinkClick={(ev, item) => {
                  onSelect(item.id);
                  ev.preventDefault();
                }}
                selectedKey={isRoot ? '_all' : subPath}
                groups={navLinks}
                className={'dialogNavTree'}
                data-testid={'dialogNavTree'}
              />
            </div>
          </Tree>
        </div>
        <div css={contentEditor}>
          {editMode ? (
            <CodeEditor file={luFile} onChange={onChange} errorMsg={errorMsg} />
          ) : (
            <TableView file={luFile} activeDialog={activeDialog} onEdit={onTableViewWantEdit} />
          )}
        </div>
      </div>
    </Fragment>
  );
};
