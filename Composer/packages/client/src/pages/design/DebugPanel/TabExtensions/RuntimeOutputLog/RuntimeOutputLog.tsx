// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';
import { default as AnsiUp } from 'ansi_up';
import { useEffect, useRef } from 'react';
import sanitizeHtml from 'sanitize-html';

import { botRuntimeErrorState, botRuntimeLogState } from '../../../../../recoilModel';
import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';
import { ErrorCallout } from '../../../../../components/BotRuntimeController/ErrorCallout';

const ansiUp = new AnsiUp();
const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

const createMarkup = (txt: string) => {
  return { __html: sanitizeHtml(ansiUp.ansi_to_html(txt)) };
};

export const RuntimeOutputLog: React.FC<{ projectId: string }> = ({ projectId }) => {
  const runtimeLogs = useRecoilValue(botRuntimeLogState(projectId));
  const botRuntimeErrors = useRecoilValue(botRuntimeErrorState(projectId));
  const runtimeLogsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (runtimeLogsContainerRef?.current) {
      runtimeLogsContainerRef.current.scrollTop = runtimeLogsContainerRef.current.scrollHeight;
    }
  }, [runtimeLogs, botRuntimeErrors]);

  return (
    <div
      ref={runtimeLogsContainerRef}
      css={{
        height: 'calc(100% - 25px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '15px 24px',
        fontSize: DEFAULT_FONT_SETTINGS.fontSize,
        fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
        color: `${NeutralColors.black}`,
        width: 'auto',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
      data-testid="Runtime-Output-Logs"
    >
      <div
        css={{
          margin: 0,
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap',
          lineHeight: '20px',
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={createMarkup(runtimeLogs)}
      />
      <div
        css={{
          color: `${SharedColors.red10}`,
        }}
      >
        <ErrorCallout error={botRuntimeErrors} />
      </div>
    </div>
  );
};
