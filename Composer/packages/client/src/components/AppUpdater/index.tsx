// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import formatMessage from 'format-message';

import { StoreContext } from '../../store';
import { AppUpdaterStatus } from '../../constants';

import { dialogContent, dialogCopy, dialogFooter, optionRoot, optionIcon, updateAvailableDismissBtn } from './styles';

const { ipcRenderer } = window as any;

function SelectOption(props) {
  const { checked, text, key } = props;
  return (
    <div key={key} css={optionRoot}>
      <Icon iconName={checked ? 'RadioBtnOn' : 'RadioBtnOff'} css={optionIcon(checked)} />
      <span>{text}</span>
    </div>
  );
}

const downloadOptions = {
  downloadOnly: 'downloadOnly',
  installAndUpdate: 'installAndUpdate',
};

export const AppUpdater: React.FC<{}> = _props => {
  const {
    actions: { setAppUpdateError, setAppUpdateProgress, setAppUpdateShowing, setAppUpdateStatus },
    state: { appUpdate },
  } = useContext(StoreContext);
  const { downloadSizeInBytes, error, progressPercent, showing, status, version } = appUpdate;
  const [downloadOption, setDownloadOption] = useState(downloadOptions.installAndUpdate);

  const handleDismiss = useCallback(() => {
    setAppUpdateShowing(false);
    if (status === AppUpdaterStatus.UPDATE_UNAVAILABLE || status === AppUpdaterStatus.UPDATE_FAILED) {
      setAppUpdateStatus({ status: AppUpdaterStatus.IDLE, version: undefined });
    }
  }, [showing, status]);

  const handlePreDownloadOkay = useCallback(() => {
    // notify main to download the update
    setAppUpdateStatus({ status: AppUpdaterStatus.UPDATE_IN_PROGRESS });
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

  // listen for app updater events from main process
  useEffect(() => {
    ipcRenderer.on('app-update', (_event, name, payload) => {
      switch (name) {
        case 'update-available':
          setAppUpdateStatus({ status: AppUpdaterStatus.UPDATE_AVAILABLE, version: payload.version });
          setAppUpdateShowing(true);
          break;

        case 'progress': {
          const progress = (payload.percent as number).toFixed(2);
          setAppUpdateProgress({ progressPercent: progress, downloadSizeInBytes: payload.total });
          break;
        }

        case 'update-not-available': {
          const explicit = payload;
          if (explicit) {
            // the user has explicitly checked for an update via the Help menu;
            // we should display some UI feedback if there are no updates available
            setAppUpdateStatus({ status: AppUpdaterStatus.UPDATE_UNAVAILABLE });
            setAppUpdateShowing(true);
          }
          break;
        }

        case 'update-downloaded':
          setAppUpdateStatus({ status: AppUpdaterStatus.UPDATE_SUCCEEDED });
          setAppUpdateShowing(true);
          break;

        case 'error':
          setAppUpdateStatus({ status: AppUpdaterStatus.UPDATE_FAILED });
          setAppUpdateError(payload);
          setAppUpdateShowing(true);
          break;

        default:
          break;
      }
    });
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
            required={true}
          />
        );

      case AppUpdaterStatus.UPDATE_FAILED:
        return <p css={dialogCopy}>{`${formatMessage(`Couldn't complete the update:`)} ${error}`}</p>;

      case AppUpdaterStatus.UPDATE_IN_PROGRESS: {
        let trimmedTotalInMB;
        if (downloadSizeInBytes === undefined) {
          trimmedTotalInMB = 'Calculating...';
        } else {
          trimmedTotalInMB = `${((downloadSizeInBytes || 0) / 1000000).toFixed(2)}MB`;
        }
        const progressInHundredths = (progressPercent || 0) / 100;
        return (
          <ProgressIndicator
            label={formatMessage('Downloading...')}
            description={`${progressPercent}% ${formatMessage('of')} ${trimmedTotalInMB}`}
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
            <DefaultButton onClick={handleDismiss} styles={updateAvailableDismissBtn} text={formatMessage('Cancel')} />
            <PrimaryButton onClick={handlePreDownloadOkay} text={formatMessage('Okay')} />
          </div>
        );

      case AppUpdaterStatus.UPDATE_SUCCEEDED:
        return <PrimaryButton onClick={handlePostDownloadOkay} text={formatMessage('Okay')} />;

      case AppUpdaterStatus.UPDATE_FAILED:
        return <PrimaryButton onClick={handleDismiss} text={formatMessage('Okay')} />;

      case AppUpdaterStatus.UPDATE_UNAVAILABLE:
        return <PrimaryButton onClick={handleDismiss} text={formatMessage('Okay')} />;

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

  return showing ? (
    <Dialog
      hidden={false}
      onDismiss={handleDismiss}
      dialogContentProps={{
        styles: dialogContent,
        subText: subText,
        type: DialogType.close,
        title,
      }}
      minWidth={427}
      maxWidth={427}
      modalProps={{
        isBlocking: false,
      }}
    >
      {content}
      <DialogFooter styles={dialogFooter}>{footer}</DialogFooter>
    </Dialog>
  ) : null;
};
