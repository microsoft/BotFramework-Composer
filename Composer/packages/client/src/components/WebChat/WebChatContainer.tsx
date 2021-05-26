// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';

import { zIndices } from '../../utils/zIndices';
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
        zIndex: zIndices.webChatContainer,
        display: isWebChatPanelVisible ? 'block' : 'none',
        background: `${NeutralColors.white}`,
        boxShadow: '-4px 0px 6px 1px rgb(0 0 0 / 10%)',
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
