/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, Fragment, useEffect, useState, useMemo } from 'react';
import formatMessage from 'format-message';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { navigate } from '@reach/router';

import { OpenAlertModal, DialogStyle } from '../../components/Modal';
import { BASEPATH } from '../../constants';
import { Store } from '../../store/index';
import { resolveToBasePath } from '../../utils/fileUtil';
import { ContentHeaderStyle, ContentStyle, flexContent, actionButton } from '../language-understanding/styles';
import { projectContainer, projectTree, projectWrapper } from '../design/styles';

import { Tree } from './../../components/Tree';
import '../language-understanding/style.css';
import Content from './content';
import { ToolBar } from './../../components/ToolBar/index';
import { TestController } from './../../TestController';

const mapNavPath = x => resolveToBasePath(BASEPATH, x);

export const LGPage = props => {
  const { state, actions } = useContext(Store);
  const { lgFiles, dialogs } = state;
  const [textMode, setTextMode] = useState(false);
  const [newContent, setNewContent] = useState(null);
  const [lgFile, setLgFile] = useState(null);

  const subPath = props['*'];

  const activePath = subPath === '' ? '_all' : subPath;
  const activeDialog = dialogs.find(item => item.id === subPath);

  // for now, one bot only have one lg file by default. all dialog share one lg
  // file.
  useEffect(() => {
    if (lgFiles.length) {
      setLgFile({
        ...lgFiles[0],
      });
    }
  }, [lgFiles]);

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

  // if dialog not find, navigate to all.
  useEffect(() => {
    if (!activeDialog && subPath && dialogs.length) {
      navigate(mapNavPath('language-generation'));
    }

    setNewContent(null);
  }, [activePath, dialogs, lgFiles]);

  function onSelect(id) {
    if (newContent) {
      OpenAlertModal(formatMessage('You have unsaved changes on this page!'));
      return;
    }
    if (id === '_all') {
      navigate(mapNavPath('/language-generation'));
    } else {
      navigate(mapNavPath(`language-generation/${id}`));
    }
    setTextMode(false); // back to table view
  }

  function onChange(newContent) {
    setNewContent(newContent);
  }

  function discardChanges() {
    setLgFile({
      ...lgFiles[0],
    });
    setNewContent(null);
  }

  async function onSave() {
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
  function onTableViewWantEdit(template) {
    console.log(template);
    setTextMode(true);
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
        <div>Bot says..</div>
        <div css={flexContent}>
          {textMode && (
            <Fragment>
              <PrimaryButton
                iconProps={{
                  iconName: 'Save',
                }}
                onClick={() => onSave()}
                disabled={!newContent}
                styles={{ root: { marginRight: '10px' } }}
              >
                {formatMessage('Save')}
              </PrimaryButton>
              <DefaultButton
                iconProps={{
                  iconName: 'Undo',
                }}
                onClick={() => discardChanges()}
                disabled={!newContent}
              >
                {formatMessage('Discard changes')}
              </DefaultButton>
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
        <div css={projectContainer}>
          <Tree variant="large" extraCss={projectTree}>
            <div css={projectWrapper}>
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
          </Tree>
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
