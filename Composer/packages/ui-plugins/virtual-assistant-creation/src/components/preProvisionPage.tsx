// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useContext } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { IAvailableHostedSkill } from '../models/stateModels';
import { Text, ITextProps } from 'office-ui-fabric-react/lib/Text';
import { mergeStyles, mergeStyleSets } from '@uifabric/merge-styles';
import { Separator, ISeparatorStyles } from 'office-ui-fabric-react/lib/Separator';
import { AppContext } from './VirtualAssistantCreationModal';
import { DialogFooterWrapper } from './dialogFooterWrapper';
import { RouterPaths } from '../shared/constants';

interface PreProvisionPageProps
  extends RouteComponentProps<{
    location: string;
  }> {
  onDismiss: () => void;
  onSubmit: () => void;
}

export const PreProvisionPage: React.FC<PreProvisionPageProps> = (props) => {
  const { state, setState } = useContext(AppContext);
  const { onDismiss, onSubmit } = props;

  let KeyValueClassName = mergeStyles({
    display: 'block',
  });
  let categoryText = (text: string) => {
    let className = mergeStyles({
      display: 'block',
    });
    const separatorStyles: Partial<ISeparatorStyles> = {
      root: { color: 'black' },
    };
    return (
      <div>
        <br />
        <Text className={className} variant="xLarge">
          {text}
        </Text>
        <Separator styles={separatorStyles} />
      </div>
    );
  };

  let keyText = (text: string) => {
    let className = mergeStyles({
      fontWeight: '500',
    });

    return (
      <Text className={className} variant="mediumPlus">
        {text}
      </Text>
    );
  };

  let valueText = (text: string) => {
    let className = mergeStyles({
      // display: 'inline'
    });
    return (
      <Text className={className} variant="mediumPlus">
        {text}
      </Text>
    );
  };

  let renderSkillsList = () => {
    return (
      <div>
        {state.selectedSkills.map((selectedSkill: IAvailableHostedSkill) => {
          return <div>- {valueText(selectedSkill.name)}</div>;
        })}
      </div>
    );
  };
  return (
    <Fragment>
      <DialogWrapper
        isOpen={true}
        // onDismiss={null}
        title={'Provisioning Summary'}
        subText={'The following resources will be provisioned for you'}
        dialogType={DialogTypes.CreateFlow}
      >
        <div>
          {categoryText('General')}
          <div className={KeyValueClassName}>
            {keyText('Selected Assistant Type: ')}
            {valueText(state.selectedAssistant.name)}
          </div>
          <div className={KeyValueClassName}>
            {keyText('Bot Name: ')}
            {valueText(state.selectedBotName)}
          </div>
          <div className={KeyValueClassName}>
            {keyText('Personality Choice: ')}
            {valueText(state.selectedPersonality)}
          </div>
          <div className={KeyValueClassName}>
            {keyText('Supported User Inputs: ')}
            {valueText(state.selectedUserInput.toString())}
          </div>
          <div className={KeyValueClassName}>
            {keyText('Supported User Languages: ')}
            {valueText(state.selectedLanguages.toString())}
          </div>
          {categoryText('Skills')}
          {renderSkillsList()}
          {categoryText('Content')}
          <div className={KeyValueClassName}>
            {keyText('Greeting Message: ')}
            {valueText(state.selectedGreetingMessage)}
          </div>
          <div className={KeyValueClassName}>
            {keyText('Welcome Image: ')}
            {valueText(state.selectedWelcomeImage)}
          </div>
          <div className={KeyValueClassName}>
            {keyText('Fallback Text: ')}
            {valueText(state.selectedFallbackText)}
          </div>
        </div>
        <DialogFooterWrapper prevPath={RouterPaths.customizeBotPage} onSubmit={onSubmit} onDismiss={onDismiss} />
      </DialogWrapper>
    </Fragment>
  );
};

export default PreProvisionPage;
