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

interface ConfigSummaryPageProps
  extends RouteComponentProps<{
    location: string;
  }> {
  onDismiss: () => void;
}

export const ConfigSummaryPage: React.FC<ConfigSummaryPageProps> = (props) => {
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
      fontWeight: 'bold',
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
        title={'Configuration Summary'}
        subText={'The following customizations will be applied to your bot'}
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
            {keyText('Bot configured for Text: ')}
            {valueText(state.isTextEnabled.toString())}
          </div>
          <div className={KeyValueClassName}>
            {keyText('Bot configured for Speech: ')}
            {valueText(state.isSpeechEnabled.toString())}
          </div>
          {/* <div className={KeyValueClassName}>
            {keyText('Supported User Languages: ')}
            {valueText(state.selectedLanguages.toString())}
          </div> */}
          {/* {categoryText('Skills')}
          {renderSkillsList()} */}
          {categoryText('Content')}
          <div className={KeyValueClassName}>
            {keyText('Greeting Message: ')}
            {valueText(state.selectedGreetingMessage)}
          </div>
          <div className={KeyValueClassName}>
            {keyText('Fallback Text: ')}
            {valueText(state.selectedFallbackText)}
          </div>
        </div>
        <DialogFooterWrapper
          prevPath={RouterPaths.customizeBotPage}
          nextPath={RouterPaths.provisionSummaryPage}
          onDismiss={onDismiss}
        />
      </DialogWrapper>
    </Fragment>
  );
};

export default ConfigSummaryPage;
