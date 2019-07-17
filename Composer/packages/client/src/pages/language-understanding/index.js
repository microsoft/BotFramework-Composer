/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext, useMemo, Fragment, useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { Nav } from 'office-ui-fabric-react/lib/Nav';
import { navigate } from '@reach/router';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { OpenAlertModal, DialogStyle } from '../../components/Modal';
import { Store } from '../../store/index';

import { ContentHeaderStyle, ContentStyle, flexContent, actionButton } from './styles';
import Content from './content';
import { ToolBar } from './../../components/ToolBar/index';
import { TestController } from './../../TestController';

export const LUPage = props => {
  const { actions, state } = useContext(Store);
  const { dialogs, luFiles } = state;
  const updateLuFile = actions.updateLuFile;
  const [textMode, setTextMode] = useState(false);
  const [newContent, setNewContent] = useState(null);
  const [luFile, setLuFile] = useState(null);

  const subPath = props['*'];
  const activePath = subPath === '' ? '_all' : subPath;
  const activeDialog = dialogs.find(item => item.id === subPath);

  useEffect(() => {
    if (luFiles.length && activeDialog) {
      setLuFile({
        ...luFiles.find(luFile => luFile.id === activeDialog.id),
      });
    }
  }, [luFiles, activeDialog]);

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

  // if dialog not find, navigate to all. if all dialog selected, disable textMode
  useEffect(() => {
    if (activePath === '_all') {
      setTextMode(false);
    }

    if (!activeDialog && subPath && dialogs.length) {
      navigate('/language-understanding');
    }

    setNewContent(null);
  }, [activePath, dialogs, luFiles]);

  const UIShowEditingToolBar = useMemo(() => {
    return newContent !== null;
  }, [newContent]);

  const UIShowEditingAlert = useMemo(() => {
    return newContent !== null;
  }, [newContent]);

  function onSelect(id) {
    if (UIShowEditingAlert) {
      OpenAlertModal(formatMessage('You have unsaved changes on this page!'));
      return;
    }
    if (id === '_all') {
      navigate(`/language-understanding`);
    } else {
      navigate(`/language-understanding/${id}`);
    }
  }

  function onChange(newContent) {
    setNewContent(newContent);
  }

  function discardChanges() {
    setLuFile({
      ...luFiles.find(luFile => luFile.id === activeDialog.id),
    });
    setNewContent(null);
  }

  async function onSave() {
    const payload = {
      id: activeDialog.id, // current opened lu file
      content: newContent,
    };
    try {
      await updateLuFile(payload);
    } catch (error) {
      const title = `StaticValidationError`;
      const subTitle = error.message;
      OpenAlertModal(title, subTitle, {
        style: DialogStyle.Console,
      });
    }
  }

  // #TODO: get line number from lu parser, then deep link to code editor this
  // Line
  function onTableViewWantEdit(template) {
    navigate(`/language-understanding/${template.fileId}`);
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
        <div>User says..</div>
        <div css={flexContent}>
          {UIShowEditingToolBar && (
            <Fragment>
              <ActionButton
                iconProps={{
                  iconName: 'Save',
                }}
                split={true}
                onClick={() => onSave()}
              >
                Save file
              </ActionButton>
              <ActionButton
                iconProps={{
                  iconName: 'Undo',
                }}
                onClick={() => discardChanges()}
              >
                Discard changes
              </ActionButton>
            </Fragment>
          )}
          <Toggle
            className={'toggleEditMode'}
            css={actionButton}
            onText={formatMessage('Edit mode')}
            offText={formatMessage('Edit mode')}
            checked={textMode}
            disabled={activePath === '_all'}
            onChange={() => setTextMode(!textMode)}
          />
        </div>
      </div>
      <div css={ContentStyle} data-testid="LUEditor">
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
          file={luFile}
          activeDialog={activeDialog}
          onEdit={onTableViewWantEdit}
          textMode={textMode}
          onChange={onChange}
        />
      </div>
    </Fragment>
  );
};
