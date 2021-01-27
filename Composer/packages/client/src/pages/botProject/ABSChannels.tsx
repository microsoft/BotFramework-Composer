// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useEffect, useRef, useState } from 'react';
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { useRecoilValue } from 'recoil';

import { settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { AuthClient } from '../../utils/authClient';
import { AuthDialog } from '../../components/Auth/AuthDialog';
import { armScopes } from '../../constants';
import { getTokenFromCache, isShowAuthDialog, isGetTokenFromUser } from '../../utils/auth';

// -------------------- Styles -------------------- //

const titleStyle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  margin-left: 22px;
  margin-top: 6px;
`;

// -------------------- RuntimeSettings -------------------- //

type RuntimeSettingsProps = {
  projectId: string;
  scrollToSectionId?: string;
};

export const ABSChannels: React.FC<RuntimeSettingsProps> = (props) => {
  const { projectId, scrollToSectionId } = props;
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { publishTargets } = useRecoilValue(settingsState(projectId));

  const containerRef = useRef<HTMLDivElement>(null);

  const onSelectProfile = async (evt, opt, index) => {
    let token = '';
    if (isGetTokenFromUser()) {
      if (isShowAuthDialog(false)) {
        setShowAuthDialog(true);
      }
      token = getTokenFromCache('accessToken');
    } else {
      token = await AuthClient.getAccessToken(armScopes);
    }
    console.log('GOT A TOKEN', token);

    // NOW, call ARM api to determine status of each channel...
    // Swagger file for this is here: https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/specification/botservice/resource-manager/Microsoft.BotService/stable/2020-06-02/botservice.json

    // make calls to
    // https://management.azure.com/subscriptions/:subscriptionId/resourceGroups/:resourceGroupName/providers/Microsoft.BotService/botServices/:resourceName/channels/:channelName?api-version=2020-06-02
  };

  const hasAuth = () => {
    console.log('rEADY TO GO');
  };

  useEffect(() => {
    if (containerRef.current && scrollToSectionId === '#runtimeSettings') {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToSectionId]);

  return (
    <CollapsableWrapper title={formatMessage('Azure Bot Service adapter')} titleStyle={titleStyle}>
      {showAuthDialog && (
        <AuthDialog
          needGraph={false}
          next={hasAuth}
          onDismiss={() => {
            setShowAuthDialog(false);
          }}
        />
      )}
      <div ref={containerRef}>
        <Dropdown
          options={publishTargets.map((p) => {
            return { key: p.name, text: p.name };
          })}
          placeholder={formatMessage('Choose publishing profile')}
          onChange={onSelectProfile}
        />
      </div>
    </CollapsableWrapper>
  );
};
