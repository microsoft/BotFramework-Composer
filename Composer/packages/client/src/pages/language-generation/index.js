/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, Fragment, useEffect, useState, useMemo } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { navigate } from '@reach/router';

import { OpenAlertModal, DialogStyle } from '../../components/Modal';
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

export const LGPage = props => {
  const { state, actions } = useContext(StoreContext);
  const { lgFiles, dialogs } = state;
  const [editMode, setEditMode] = useState(false);

  const subPath = props['*'];
  const isRoot = subPath === '';
  const activeDialog = dialogs.find(item => item.id === subPath);

  // for now, one bot only have one lg file by default. all dialog share one lg
  // file.
  const lgFile = lgFiles.length && lgFiles[0];

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
    // if is not root, disable editMode
    if (!isRoot) {
      setEditMode(false);
    }

    //  if dialog not find, navigate to all
    if (!isRoot && !activeDialog && dialogs.length) {
      navigate(mapNavPath('/language-generation'));
    }
  }, [subPath, dialogs]);

  function onSelect(id) {
    if (id === '_all') {
      navigate(mapNavPath('/language-generation'));
    } else {
      navigate(mapNavPath(`language-generation/${id}`));
    }
  }

  async function onChange(newContent) {
    const payload = {
      id: lgFile.id,
      content: newContent,
    };

    try {
      await actions.updateLgFile(payload);
    } catch (error) {
      OpenAlertModal('Save Failed', error.message, {
        style: DialogStyle.Console,
      });
    }
  }

  // #TODO: get line number from lg parser, then deep link to code editor this
  // Line
  function onTableViewWantEdit() {
    navigate(mapNavPath('/language-generation'));
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
        <div>{formatMessage('Bot says')}..</div>
        <div css={flexContent}>
          <Toggle
            className={'toggleEditMode'}
            css={actionButton}
            onText={formatMessage('Edit mode')}
            offText={formatMessage('Edit mode')}
            checked={editMode}
            disabled={!isRoot && editMode === false}
            onChange={() => setEditMode(!editMode)}
          />
        </div>
      </div>
      <div css={ContentStyle} data-testid="LGEditor">
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
            <CodeEditor file={lgFile} onChange={onChange} />
          ) : (
            <TableView file={lgFile} activeDialog={activeDialog} onEdit={onTableViewWantEdit} />
          )}
        </div>
      </div>
    </Fragment>
  );
};
