/* eslint-disable react/prop-types */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useContext, useRef } from 'react';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { newContainer, sampleItem, sampleList, newTip, locationSelection } from './styles';
import { LocationSelectContent } from './LocationSelectContent';
import { Store } from './../../store';

export function NewContent(props) {
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState([]);
  const { actions } = useContext(Store);
  const selectedTemplate = useRef();
  const { fetchTemplates, closeCurrentProject, createProject } = actions;
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
    await createProject(storageId, absolutePath, selectedTemplate.current.id);
    onCloseExplorer();
  };

  return (
    <div css={newContainer}>
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
          {templates.map(item => {
            return (
              <div key={item.id} css={sampleItem} onClick={() => handleSampleClick(item)}>
                {`${item.name}`}
              </div>
            );
          })}
        </div>
      ) : (
        <div css={locationSelection}>
          <LocationSelectContent onSaveAs={handleSaveAs} />
        </div>
      )}
    </div>
  );
}
