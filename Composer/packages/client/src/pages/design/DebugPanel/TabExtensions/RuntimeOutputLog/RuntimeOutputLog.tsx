// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';
import { default as AnsiUp } from 'ansi_up';
import { useEffect, useRef } from 'react';
import sanitizeHtml from 'sanitize-html';

import { botBuildTimeErrorState, runtimeStandardOutputDataState } from '../../../../../recoilModel';
import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';
import { ErrorCallout } from '../../../../../components/BotRuntimeController/ErrorCallout';

const ansiUp = new AnsiUp();
const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

const createMarkup = (txt: string) => {
  return { __html: sanitizeHtml(ansiUp.ansi_to_html(txt)) };
};

export const RuntimeOutputLog: React.FC<{ projectId: string }> = ({ projectId }) => {
  const runtimeData = useRecoilValue(runtimeStandardOutputDataState(projectId));
  const botBuildErrors = useRecoilValue(botBuildTimeErrorState(projectId));

  const runtimeLogsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (runtimeLogsContainerRef?.current) {
      runtimeLogsContainerRef.current.scrollTop = runtimeLogsContainerRef.current.scrollHeight;
    }
  }, [runtimeData]);

  return (
    <div
      ref={runtimeLogsContainerRef}
      css={{
        height: 'calc(100% - 25px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 16px',
        fontSize: DEFAULT_FONT_SETTINGS.fontSize,
        fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
        color: `${NeutralColors.black}`,
        width: 'auto',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
      data-testid="runtime-output-logs"
    >
      {runtimeData.standardOutput && (
        <div
          css={{
            margin: 0,
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            fontSize: FontSizes.size12,
          }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={createMarkup(runtimeData.standardOutput)}
          data-testid="runtime-standard-output"
        />
      )}
      {botBuildErrors && <ErrorCallout error={botBuildErrors} />}
      {runtimeData.standardError && <ErrorCallout error={runtimeData.standardError} />}
    </div>
  );
};
