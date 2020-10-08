// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable format-message/literal-pattern */

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import React, { Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Separator, ISeparatorStyles } from 'office-ui-fabric-react/lib/Separator';

import { RouterPaths } from '../constants';
import { IAppState } from '../models/stateModels';

import { DialogFooterWrapper } from './DialogFooterWrapper';

// -------------------- Styles -------------------- //

const renderCategoryTextStyling = css`
  display: block;
  margin-top: 10px;
`;

const entryTextStyle = (bold: boolean) => css`
  display: inline;
  font-weight: ${bold ? 'bold' : 'initial'};
`;

const separatorStyles: Partial<ISeparatorStyles> = {
  root: { color: 'black' },
};

// -------------------- ConfigSummaryPage -------------------- //
type ConfigSummaryPageProps = {
  onDismiss: () => void;
  appState: IAppState;
} & RouteComponentProps<{}>;

export const ConfigSummaryPage: React.FC<ConfigSummaryPageProps> = (props) => {
  const { onDismiss, appState } = props;

  const renderCategoryText = (text: string) => {
    return (
      <div css={renderCategoryTextStyling}>
        <Text variant="xLarge">{text}</Text>
        <Separator styles={separatorStyles} />
      </div>
    );
  };

  const renderConfigEntry = (name: string, value: string) => {
    return (
      <div>
        <Text css={entryTextStyle(true)}>{name} : </Text>
        <Text css={entryTextStyle(false)}>{value}</Text>
      </div>
    );
  };

  return (
    <Fragment>
      <DialogWrapper
        isOpen
        dialogType={DialogTypes.CreateFlow}
        subText={formatMessage('The following customizations will be applied to your bot')}
        title={formatMessage('Configuration Summary')}
        onDismiss={props.onDismiss}
      >
        {renderCategoryText(formatMessage('General'))}
        {renderConfigEntry(
          formatMessage('Selected Assistant Type'),
          appState.SelectBotPageState.selectedAssistant.name
        )}
        {renderConfigEntry(formatMessage('Bot Name'), appState.CustomizeBotPageState.selectedBotName)}
        {renderConfigEntry(formatMessage('Personality Choice'), appState.CustomizeBotPageState.selectedPersonality)}
        {renderConfigEntry(
          formatMessage('Bot Configured for Text'),
          appState.CustomizeBotPageState.isTextEnabled.toString()
        )}
        {renderConfigEntry(
          formatMessage('Bot Configured for Speech'),
          appState.CustomizeBotPageState.isSpeechEnabled.toString()
        )}
        {renderCategoryText(formatMessage('Content'))}
        {renderConfigEntry(formatMessage('Greeting Message'), appState.CustomizeBotPageState.selectedGreetingMessage)}
        {renderConfigEntry(formatMessage('Fallback Text'), appState.CustomizeBotPageState.selectedFallbackText)}
        <DialogFooterWrapper
          nextPath={RouterPaths.provisionSummaryPage}
          prevPath={RouterPaths.customizeBotPage}
          onDismiss={onDismiss}
        />
      </DialogWrapper>
    </Fragment>
  );
};
