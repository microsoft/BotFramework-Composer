/* eslint-disable react/prop-types */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useContext } from 'react';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { sampleItem, sampleList, newTip } from './styles';
import { LocationSelectContent } from './LocationSelectContent';
import { Store } from './../../store';

export function NewContent(props) {
  const [step, setStep] = useState(0);
  const [project, setProject] = useState();
  const { state, actions } = useContext(Store);
  const { fetchFolderItemsByPath, openBotProject, closeCurrentProject, saveProjectAs } = actions;
  const { focusedStorageFolder } = state;
  const { onCloseExplorer } = props;

  useEffect(() => {
    fetchFolderItemsByPath('default', 'D:/work/BotFramework-Composer/SampleBots');
  }, []);

  const handleSampleClick = item => {
    setProject(item);
    setStep(1);
  };

  const handleSaveAs = async (storageId, absolutePath) => {
    closeCurrentProject();
    await openBotProject('default', project.path + '/bot.botproj');
    await saveProjectAs(storageId, absolutePath);
    onCloseExplorer();
  };

  return (
    <div>
      <div css={newTip}>
        <span>{formatMessage(`Choose a ${step === 0 ? 'template' : 'location to save'}`)}</span>
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
          {focusedStorageFolder.children &&
            focusedStorageFolder.children.map((item, index) => {
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
