// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Dialog,
  DialogFooter,
  DialogType,
  IDialogContentStyles,
  IDialogFooterStyles,
} from '@fluentui/react/lib/Dialog';
import { DefaultButton, PrimaryButton, IButtonStyles } from '@fluentui/react/lib/Button';
import { Icon } from '@fluentui/react/lib/Icon';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { ChoiceGroup } from '@fluentui/react/lib/ChoiceGroup';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { SharedColors, NeutralColors } from '@fluentui/theme';
import { IpcRendererEvent } from 'electron';

import { AppUpdaterStatus } from '../../constants';
import { appUpdateState, dispatcherState } from '../../recoilModel';

import { breakingUpdatesMap } from './breakingUpdates/breakingUpdatesMap';

const updateAvailableDismissBtn: Partial<IButtonStyles> = {
  root: {
    marginRight: '6px;',
  },
};

const optionIcon = (checked: boolean) => css`
  vertical-align: text-bottom;
  font-size: 18px;
  margin-right: 10px;
  color: ${checked ? SharedColors.cyanBlue10 : NeutralColors.black};
`;

const optionRoot = css`
  width: 100%;
  height: 100%;
`;

const dialogCopy = css`
  margin: 0px;
  color: #000;
  word-wrap: break-word;
  word-break: break-all;
`;

const dialogFooter: Partial<IDialogFooterStyles> = {
  actions: {
    marginTop: '46px',
  },
};

const dialogContent: Partial<IDialogContentStyles> = {
  subText: { color: NeutralColors.black },
  header: { paddingBottom: '6px' },
};

// -------------------- Helpers -------------------- //

const { ipcRenderer } = window;

type SelectOptionProps = {
  checked?: boolean;
  text: string;
  key?: string;
};

function SelectOption(props: SelectOptionProps | undefined) {
  if (props == null) return null;
  const { checked = false, text, key } = props;
  return (
    <div key={key} css={optionRoot}>
      <Icon css={optionIcon(checked)} iconName={checked ? 'RadioBtnOn' : 'RadioBtnOff'} />
      <span>{text}</span>
    </div>
  );
}

const downloadOptions = {
  downloadOnly: 'downloadOnly',
  installAndUpdate: 'installAndUpdate',
};

// TODO: factor this out into shared or types
type BreakingUpdateMetaData = {
  explicitCheck: boolean;
  uxId: string;
};

// -------------------- AppUpdater -------------------- //

export const AppUpdater: React.FC = () => {
  const { setAppUpdateError, setAppUpdateProgress, setAppUpdateShowing, setAppUpdateStatus } =
    useRecoilValue(dispatcherState);
  const { downloadSizeInBytes, error, progressPercent, showing, status, version } = useRecoilValue(appUpdateState);
  const [downloadOption, setDownloadOption] = useState(downloadOptions.installAndUpdate);
  const [breakingMetaData, setBreakingMetaData] = useState<BreakingUpdateMetaData | undefined>(undefined);

  const handleDismiss = useCallback(() => {
    setAppUpdateShowing(false);
    setBreakingMetaData(undefined);
    if (status === AppUpdaterStatus.UPDATE_UNAVAILABLE || status === AppUpdaterStatus.UPDATE_FAILED) {
      setAppUpdateStatus(AppUpdaterStatus.IDLE, undefined);
    }
  }, [showing, status]);

  const handlePreDownloadOkay = useCallback(() => {
    // notify main to download the update
    setAppUpdateStatus(AppUpdaterStatus.UPDATE_IN_PROGRESS, undefined);
    ipcRenderer.send('app-update', 'start-download');
  }, []);

  const handlePostDownloadOkay = useCallback(() => {
    setAppUpdateShowing(false);
    if (downloadOption === downloadOptions.installAndUpdate) {
      ipcRenderer.send('app-update', 'install-update');
    }
  }, [downloadOption]);

  const handleDownloadOptionChange = useCallback((_ev, option) => {
    setDownloadOption(option);
  }, []);

  // necessary?
  const handleContinueFromBreakingUx = useCallback(() => {
    handlePreDownloadOkay();
  }, [handlePreDownloadOkay]);

  // listen for app updater events from main process
  useEffect(() => {
    ipcRenderer.on(
      'app-update',
      (_event: IpcRendererEvent, name: string, payload, breakingMetaData?: BreakingUpdateMetaData) => {
        switch (name) {
          case 'update-available':
            setAppUpdateStatus(AppUpdaterStatus.UPDATE_AVAILABLE, payload.version);
            setAppUpdateShowing(true);
            break;

          case 'progress': {
            const progress = +(payload.percent as number).toFixed(2);
            setAppUpdateProgress(progress, payload.total);
            break;
          }

          case 'update-in-progress': {
            setAppUpdateStatus(AppUpdaterStatus.UPDATE_AVAILABLE, payload.version);
            setAppUpdateShowing(true);
            break;
          }

          case 'update-not-available': {
            const explicit = payload;
            if (explicit) {
              // the user has explicitly checked for an update via the Help menu;
              // we should display some UI feedback if there are no updates available
              setAppUpdateStatus(AppUpdaterStatus.UPDATE_UNAVAILABLE, undefined);
              setAppUpdateShowing(true);
            }
            break;
          }

          case 'update-downloaded':
            setAppUpdateStatus(AppUpdaterStatus.UPDATE_SUCCEEDED, undefined);
            setAppUpdateShowing(true);
            break;

          case 'error':
            setAppUpdateStatus(AppUpdaterStatus.UPDATE_FAILED, undefined);
            setAppUpdateError(payload);
            setAppUpdateShowing(true);
            break;

          case 'breaking-update-available':
            if (breakingMetaData) {
              setBreakingMetaData(breakingMetaData);
              setAppUpdateStatus(AppUpdaterStatus.BREAKING_UPDATE_AVAILABLE, payload.version);
              setAppUpdateShowing(true);
            }
            break;

          default:
            break;
        }
      },
    );
  }, []);

  const title = useMemo(() => {
    switch (status) {
      case AppUpdaterStatus.UPDATE_AVAILABLE:
        return formatMessage('New update available');

      case AppUpdaterStatus.UPDATE_FAILED:
        return formatMessage('Update failed');

      case AppUpdaterStatus.UPDATE_IN_PROGRESS:
        return formatMessage('Update in progress');

      case AppUpdaterStatus.UPDATE_SUCCEEDED:
        return formatMessage('Update complete');

      case AppUpdaterStatus.UPDATE_UNAVAILABLE:
        return formatMessage('No updates available');

      case AppUpdaterStatus.IDLE:
        return '';

      default:
        return '';
    }
  }, [status]);

  const content = useMemo(() => {
    switch (status) {
      case AppUpdaterStatus.UPDATE_AVAILABLE:
        return (
          <ChoiceGroup
            required
            defaultSelectedKey={downloadOptions.installAndUpdate}
            options={[
              {
                key: downloadOptions.installAndUpdate,
                text: formatMessage('Install the update and restart Composer.'),
                onRenderField: SelectOption,
              },
              {
                key: downloadOptions.downloadOnly,
                text: formatMessage('Download now and install when you close Composer.'),
                onRenderField: SelectOption,
              },
            ]}
            onChange={handleDownloadOptionChange}
          />
        );

      case AppUpdaterStatus.UPDATE_FAILED:
        return <p css={dialogCopy}>{`${formatMessage(`Couldn't complete the update:`)} ${error}`}</p>;

      case AppUpdaterStatus.UPDATE_IN_PROGRESS: {
        let trimmedTotalInMB;
        if (downloadSizeInBytes === undefined) {
          trimmedTotalInMB = formatMessage('Calculating...');
        } else {
          trimmedTotalInMB = formatMessage('{total}MB', {
            total: (downloadSizeInBytes / 1000000).toFixed(2),
          });
        }
        const progressInHundredths = (progressPercent ?? 0) / 100;
        return (
          <ProgressIndicator
            description={formatMessage('{progress}% of {total}', {
              progress: progressPercent,
              total: trimmedTotalInMB,
            })}
            label={formatMessage('Downloading...')}
            percentComplete={progressInHundredths}
          />
        );
      }

      case AppUpdaterStatus.UPDATE_SUCCEEDED: {
        const text =
          downloadOption === downloadOptions.installAndUpdate
            ? formatMessage('Composer will restart.')
            : formatMessage('Composer will update the next time you close the app.');
        return <p css={dialogCopy}>{text}</p>;
      }

      case AppUpdaterStatus.UPDATE_UNAVAILABLE:
        return <p css={dialogCopy}>{formatMessage('Composer is up to date.')}</p>;

      case AppUpdaterStatus.IDLE:
        return undefined;

      default:
        return undefined;
    }
  }, [status, progressPercent, error]);

  const footer = useMemo(() => {
    switch (status) {
      case AppUpdaterStatus.UPDATE_AVAILABLE:
        return (
          <div>
            <DefaultButton styles={updateAvailableDismissBtn} text={formatMessage('Cancel')} onClick={handleDismiss} />
            <PrimaryButton text={formatMessage('Okay')} onClick={handlePreDownloadOkay} />
          </div>
        );

      case AppUpdaterStatus.UPDATE_SUCCEEDED:
        return <PrimaryButton text={formatMessage('Okay')} onClick={handlePostDownloadOkay} />;

      case AppUpdaterStatus.UPDATE_FAILED:
        return <PrimaryButton text={formatMessage('Okay')} onClick={handleDismiss} />;

      case AppUpdaterStatus.UPDATE_UNAVAILABLE:
        return <PrimaryButton text={formatMessage('Okay')} onClick={handleDismiss} />;

      case AppUpdaterStatus.UPDATE_IN_PROGRESS:
        return undefined;

      case AppUpdaterStatus.IDLE:
        return undefined;

      default:
        return undefined;
    }
  }, [status]);

  const subText =
    status === AppUpdaterStatus.UPDATE_AVAILABLE ? `${formatMessage('Bot Framework Composer')} v${version}` : '';

  if (status === AppUpdaterStatus.BREAKING_UPDATE_AVAILABLE && showing && breakingMetaData) {
    const BreakingUpdateUx = breakingUpdatesMap[breakingMetaData.uxId];
    // TODO: check if breaking update ux component is defined and handle undefined case
    return (
      <BreakingUpdateUx
        explicitCheck={breakingMetaData.explicitCheck}
        version={version}
        onCancel={handleDismiss}
        onContinue={handleContinueFromBreakingUx}
      />
    );
  }

  return showing ? (
    <Dialog
      dialogContentProps={{
        styles: dialogContent,
        subText: subText,
        type: DialogType.close,
        title,
      }}
      hidden={false}
      maxWidth={427}
      minWidth={427}
      modalProps={{
        isBlocking: false,
      }}
      onDismiss={handleDismiss}
    >
      {content}
      <DialogFooter styles={dialogFooter}>{footer}</DialogFooter>
    </Dialog>
  ) : null;
};
