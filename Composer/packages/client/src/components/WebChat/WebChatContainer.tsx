// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';

import { isWebChatPanelVisibleState, webChatEssentialsSelector, rootBotProjectIdSelector } from '../../recoilModel';
import { BASEPATH } from '../../constants';
import { WebChatPanel } from '../../components/WebChat/WebChatPanel';

export const WebChatContainer = () => {
  const rootBotId = useRecoilValue(rootBotProjectIdSelector) ?? '';
  const webchatEssentials = useRecoilValue(webChatEssentialsSelector(rootBotId));
  const isWebChatPanelVisible = useRecoilValue(isWebChatPanelVisibleState);

  return (
    <div
      css={{
        position: 'absolute',
        height: '100%',
        width: '395px',
        right: 0,
        zIndex: 10,
        display: isWebChatPanelVisible ? 'block' : 'none',
        background: `${NeutralColors.white}`,
        boxShadow: 'rgb(0 0 0 / 22%) 0px 25.6px 57.6px 0px, rgb(0 0 0 / 18%) 0px 4.8px 14.4px 0px',
      }}
    >
      {webchatEssentials?.projectId ? (
        <WebChatPanel
          botData={{ ...webchatEssentials }}
          directlineHostUrl={BASEPATH}
          isWebChatPanelVisible={isWebChatPanelVisible}
        />
      ) : null}
    </div>
  );
};
