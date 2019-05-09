/* eslint-disable react/prop-types */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useContext, useRef } from 'react';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { sampleItem, sampleList, newTip } from './styles';
import { LocationSelectContent } from './LocationSelectContent';
import { Store } from './../../store';

export function NewContent(props) {
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState(0);
  const { actions } = useContext(Store);
  const selectedTemplate = useRef();
  const { fetchTemplates, closeCurrentProject, saveNewProject } = actions;
  const { onCloseExplorer } = props;

  useEffect(() => {
    getTemplates();
  }, []);

  const getTemplates = async () => {
    const data = await fetchTemplates();
    setTemplates(data);
  };

  const handleSampleClick = item => {
    selectedTemplate.current = item;
    setStep(1);
  };

  const handleSaveAs = async (storageId, absolutePath) => {
    closeCurrentProject();
    await saveNewProject(storageId, absolutePath, selectedTemplate.current.path + '/bot.botproj');
    onCloseExplorer();
  };

  return (
    <div>
      <div css={newTip}>
        <span>{formatMessage(`Choose a ${step === 0 ? 'template' : 'location'}`)}</span>
        {step === 1 && (
          <IconButton
            iconProps={{ iconName: 'up' }}
            onClick={() => {
              setStep(0);
            }}
          />
        )}
      </div>
      {step === 0 ? (
        <div css={sampleList}>
          {templates.children &&
            templates.children.map((item, index) => {
              return (
                <div key={index} css={sampleItem} onClick={() => handleSampleClick(item)}>
                  {`${item.name}`}
                </div>
              );
            })}
        </div>
      ) : (
        <div style={{ display: 'flex' }}>
          <LocationSelectContent onSaveAs={handleSaveAs} />
        </div>
      )}
    </div>
  );
}
