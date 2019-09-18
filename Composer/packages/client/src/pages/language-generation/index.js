import React, { useContext, Fragment, useEffect, useState, useMemo } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { get } from 'lodash';

import { OpenAlertModal, DialogStyle } from '../../components/Modal';
import { StoreContext } from '../../store';
import {
  ContentHeaderStyle,
  ContentStyle,
  flexContent,
  actionButton,
  contentEditor,
} from '../language-understanding/styles';
import { projectContainer, projectTree, projectWrapper } from '../design/styles';
import { navigateTo } from '../../utils';

import CodeEditor from './code-editor';
import { Tree } from './../../components/Tree';
import TableView from './table-view';
import { ToolBar } from './../../components/ToolBar/index';
import { TestController } from './../../TestController';

export const LGPage = props => {
  const { state, actions } = useContext(StoreContext);
  const { lgFiles, dialogs } = state;
  const [editMode, setEditMode] = useState(false);
  const [codeRange, setCodeRange] = useState(null);

  const subPath = props['*'];
  const isRoot = subPath === '';
  const activeDialog = dialogs.find(item => item.id === subPath);

  // for now, one bot only have one lg file by default. all dialog share one lg
  // file.
  const lgFile = lgFiles.length ? lgFiles[0] : null;

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
    // dialog lg templates is part of commong.lg. By restricting edit in root view, user would aware that the changes they made may affect other dialogs.
    if (!isRoot) {
      setEditMode(false);
    }

    //  fall back to the all-up page if we don't have an active dialog
    if (!isRoot && !activeDialog && dialogs.length) {
      navigateTo('/language-generation');
    }
  }, [subPath, dialogs]);

  function onSelect(id) {
    if (id === '_all') {
      navigateTo('/language-generation');
    } else {
      navigateTo(`language-generation/${id}`);
    }
  }

  function onToggleEditMode() {
    setEditMode(!editMode);
    setCodeRange(null);
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
  function onTableViewClickEdit(template) {
    console.log(template);

    setCodeRange({
      startLineNumber: get(template, 'ParseTree._start._line', 0),
      endLineNumber: get(template, 'ParseTree._stop._line', 0),
    });
    navigateTo(`/language-generation`);
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
            onChange={onToggleEditMode}
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
                styles={{
                  root: {
                    /* override dulplicate selected mark bellow All*/
                    selectors: {
                      'ul>li>ul button.ms-Nav-chevronButton:after': {
                        borderLeft: 'none',
                      },
                    },
                  },
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
            <CodeEditor file={lgFile} codeRange={codeRange} onChange={onChange} />
          ) : (
            <TableView file={lgFile} activeDialog={activeDialog} onClickEdit={onTableViewClickEdit} />
          )}
        </div>
      </div>
    </Fragment>
  );
};
