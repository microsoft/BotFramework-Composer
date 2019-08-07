/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, useMemo, Fragment, useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { navigate } from '@reach/router';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { BASEPATH } from '../../constants';
import { StoreContext } from '../../store';
import { resolveToBasePath } from '../../utils/fileUtil';
import { projectContainer, projectTree, projectWrapper } from '../design/styles';

import CodeEditor from './code-editor';
import { Tree } from './../../components/Tree';
import { ContentHeaderStyle, ContentStyle, flexContent, actionButton, contentEditor } from './styles';
import TableView from './table-view';
import { ToolBar } from './../../components/ToolBar/index';
import { TestController } from './../../TestController';

const mapNavPath = x => resolveToBasePath(BASEPATH, x);

export const LUPage = props => {
  const { actions, state } = useContext(StoreContext);
  const { dialogs, luFiles } = state;
  const updateLuFile = actions.updateLuFile;
  const [editMode, setEditMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subPath = props['*'];
  const activePath = subPath === '' ? '_all' : subPath;
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

  // if dialog not find, navigate to all. if all dialog selected, disable editMode
  useEffect(() => {
    if (activePath === '_all') {
      setEditMode(false);
    }

    if (!activeDialog && subPath && dialogs.length) {
      navigate(mapNavPath('/language-understanding'));
    }
  }, [activePath, dialogs]);

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
      await updateLuFile(payload);
      setErrorMsg('');
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

  // #TODO: get line number from lu parser, then deep link to code editor this
  // Line
  function onTableViewWantEdit(template) {
    navigate(mapNavPath(`language-understanding/${template.fileId}`));
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
            disabled={activePath === '_all'}
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
                styles={projectWrapper}
                selectedKey={activePath}
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
