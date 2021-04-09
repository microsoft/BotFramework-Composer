// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';
import { default as AnsiUp } from 'ansi_up';
import { useEffect, useRef } from 'react';
import sanitizeHtml from 'sanitize-html';
import formatMessage from 'format-message';

import { botBuildTimeErrorState, dispatcherState, runtimeStandardOutputDataState } from '../../../../../recoilModel';
import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';
import httpClient from '../../../../../utils/httpUtil';
import { ErrorCallout } from '../../../../../components/BotRuntimeController/ErrorCallout';
import { checkIfDotnetVersionMissing, missingDotnetVersionError } from '../../../../../utils/runtimeErrors';
import { BotStartError } from '../../../../../recoilModel/types';
import { Text } from '../../../../../constants';

const genericErrorMessage = () => {
  return {
    message: 'Runtime Log',
    summary: formatMessage('Error occurred trying to fetch runtime standard output'),
  };
};

const ansiUp = new AnsiUp();
const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

const createMarkup = (txt: string) => {
  return { __html: sanitizeHtml(ansiUp.ansi_to_html(txt)) };
};

export const RuntimeOutputLog: React.FC<{ projectId: string }> = ({ projectId }) => {
  const runtimeData = useRecoilValue(runtimeStandardOutputDataState(projectId));
  const botBuildErrors = useRecoilValue(botBuildTimeErrorState(projectId));
  const { setRuntimeStandardOutputData, setApplicationLevelError } = useRecoilValue(dispatcherState);

  const runtimeLogsContainerRef = useRef<HTMLDivElement | null>(null);

  const runtimeTrafficChannel = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (runtimeLogsContainerRef?.current) {
      runtimeLogsContainerRef.current.scrollTop = runtimeLogsContainerRef.current.scrollHeight;
    }
  }, [runtimeData]);

  useEffect(() => {
    const setupLogConnection = async () => {
      try {
        const runtimeStreamUrl = await httpClient.get(`/publish/runtimeLogUrl/${projectId}`);

        runtimeTrafficChannel.current = new WebSocket(runtimeStreamUrl.data);

        if (runtimeTrafficChannel.current) {
          runtimeTrafficChannel.current.onmessage = (event) => {
            const data: { standardError: string; standardOutput: string } = JSON.parse(event.data);

            let standardError: BotStartError | null = null;
            if (data.standardError) {
              const isDotnetError = checkIfDotnetVersionMissing({
                message: data.standardError ?? '',
              });

              if (isDotnetError) {
                standardError = {
                  title: Text.DOTNETFAILURE,
                  ...missingDotnetVersionError,
                };
              } else {
                standardError = {
                  title: Text.BOTRUNTIMEERROR,
                  message: data.standardError,
                };
              }
            }
            setRuntimeStandardOutputData(projectId, {
              standardError,
              standardOutput: data.standardOutput,
            });
          };
        }
      } catch (ex) {
        setApplicationLevelError(genericErrorMessage());
      }
    };

    if (!runtimeTrafficChannel.current) {
      setupLogConnection();
    }

    return () => {
      runtimeTrafficChannel.current?.close();
      runtimeTrafficChannel.current = null;
    };
  }, []);

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
            lineHeight: '20px',
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
