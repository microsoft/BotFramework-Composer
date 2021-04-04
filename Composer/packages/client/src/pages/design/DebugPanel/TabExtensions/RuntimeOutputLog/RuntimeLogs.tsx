// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';
import { default as AnsiUp } from 'ansi_up';
import { useEffect, useRef } from 'react';

import { botRuntimeErrorState, botRuntimeLogsState } from '../../../../../recoilModel';
import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';

const stdOutStreamStyle = css`
  margin: 0;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 20px;
`;

const errorTextStyle = css`
  color: ${SharedColors.red10};
`;

const ansiUp = new AnsiUp();

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

const createMarkup = (txt: string) => {
  return { __html: ansiUp.ansi_to_html(txt) };
};

export const RuntimeLogs: React.FC<{ projectId: string }> = ({ projectId }) => {
  const logs = useRecoilValue(botRuntimeLogsState(projectId));
  const botRuntimeErrors = useRecoilValue(botRuntimeErrorState(projectId));
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logRef?.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs, botRuntimeErrors]);

  return (
    <div
      ref={logRef}
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
        css={stdOutStreamStyle}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={createMarkup(logs)}
      />
      <div
        css={[stdOutStreamStyle, errorTextStyle]}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={createMarkup(botRuntimeErrors.message)}
      />
    </div>
  );
};
