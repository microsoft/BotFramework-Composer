/** @jsx jsx */
import { jsx } from '@emotion/core';
import { debounce, findIndex } from 'lodash';
import { useContext, Fragment, useEffect, useRef, useState, useMemo } from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { Store } from '../../store/index';
import { ContentHeaderStyle, ContentStyle, flexContent, actionButton } from '../language-understanding/styles';

import { ProjectTree } from './../../components/ProjectTree';

import '../language-understanding/style.css';
import Content from './content';

export const LGPage = props => {
  const { state, actions } = useContext(Store);
  const updateLgFile = useRef(debounce(actions.updateLgFile, 500)).current;
  const { lgFiles, dialogs, navPath } = state;
  const { clearNavHistory, navTo } = actions;
  const [textMode, setTextMode] = useState(false);
  const [newContent, setNewContent] = useState(null);

  // for now, one bot only have one lg file by default.
  // all dialog share one lg file.
  const lgFile = useMemo(() => {
    return lgFiles.length ? lgFiles[0] : null;
  }, [lgFiles]);

  useEffect(() => {
    setNewContent(null);
  }, [lgFiles]);

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

  const activeDialog = useMemo(() => {
    if (!navPath) return -1;
    const dialogName = navPath.split('#')[0];
    return findIndex(dialogs, { name: dialogName });
  }, [navPath]);

  function handleFileClick(index) {
    clearNavHistory();
    navTo(`${dialogs[index].name}#`);
  }

  // performance optimization, component update should only trigger by lgFile change.
  const memoizedContent = useMemo(() => {
    return <Content file={lgFile} activeDialog={activeDialog} textMode={textMode} onChange={onChange} />;
  }, [lgFile, navPath, textMode]);

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
        <ProjectTree files={dialogs} activeNode={activeDialog} onSelect={handleFileClick} />
        {memoizedContent}
      </div>
    </Fragment>
  );
};
