// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';

import { StoreContext } from '../../store';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import formatMessage from 'format-message';

import { modal, optionRoot, optionIcon } from './styles';
import { AppUpdaterStatus } from '../../constants';

const { ipcRenderer } = window as any;

function SelectOption(props) {
  const { checked, text, key } = props;
  return (
    <div key={key} css={optionRoot}>
      <Icon iconName={checked ? 'CompletedSolid' : 'RadioBtnOff'} css={optionIcon(checked)} />
      <span>{text}</span>
    </div>
  );
}

function handleChange(ev, option) {
  console.log(ev);
  console.log(option);
}

export const AppUpdater: React.FC<{}> = props => {
  const {
    actions: { setAppUpdateError, setAppUpdateProgress, setAppUpdateStatus },
    state: { appUpdate },
  } = useContext(StoreContext);
  const { downloadSizeInBytes, error, status, progressPercent } = appUpdate;

  const handleDismiss = useMemo(
    () => () => setAppUpdateStatus({ status: AppUpdaterStatus.IDLE, version: undefined }),
    []
  );

  const handleOkay = useMemo(
    () => () => {
      // notify main to download the update
      setAppUpdateStatus({ status: AppUpdaterStatus.UPDATE_IN_PROGRESS });
      ipcRenderer.send(
        'app-update',
        'start-download',
        false /* <-- flag to install and restart or just download manually*/
      );
    },
    []
  );

  // set up app update event listening
  useEffect(() => {
    ipcRenderer.on('app-update', (event, name, payload) => {
      console.log('got app update event from main: ', name);
      switch (name) {
        case 'update-available':
          setAppUpdateStatus({ status: AppUpdaterStatus.UPDATE_AVAILABLE, version: payload.version });
          break;

        case 'progress':
          const progress = (payload.percent as number).toFixed(2);
          console.log('setting progress to: ', progress);
          setAppUpdateProgress({ progressPercent: progress, downloadSizeInBytes: payload.total });
          break;

        case 'update-not-available':
          setAppUpdateStatus({ status: AppUpdaterStatus.UPDATE_UNAVAILABLE });
          break;

        case 'update-downloaded':
          setAppUpdateStatus({ status: AppUpdaterStatus.UPDATE_SUCCEEDED });
          break;

        case 'error':
          setAppUpdateStatus({ status: AppUpdaterStatus.UPDATE_FAILED });
          setAppUpdateError(payload);

        default:
          break;
      }
    });
  }, []);

  const title = useMemo(() => {
    switch (status) {
      case AppUpdaterStatus.UPDATE_AVAILABLE:
        return 'New update available';

      case AppUpdaterStatus.UPDATE_FAILED:
        return 'Update failed';

      case AppUpdaterStatus.UPDATE_IN_PROGRESS:
        return 'Update in progress';

      case AppUpdaterStatus.UPDATE_SUCCEEDED:
        return 'Update complete';

      case AppUpdaterStatus.UPDATE_UNAVAILABLE:
        return 'No updates available';

      case AppUpdaterStatus.IDLE:
      default:
        return '';
    }
  }, [status]);

  const content = useMemo(() => {
    switch (status) {
      case AppUpdaterStatus.UPDATE_AVAILABLE:
        return (
          <ChoiceGroup
            defaultSelectedKey="installAndUpdate"
            options={[
              {
                key: 'installAndUpdate',
                text: formatMessage('Install the update and restart Composer.'),
                onRenderField: SelectOption,
              },
              {
                key: 'download',
                text: formatMessage('Download the new version manually'),
                onRenderField: SelectOption,
              },
            ]}
            onChange={handleChange}
            required={true}
          />
        );

      case AppUpdaterStatus.UPDATE_FAILED:
        return <p>Couldn't complete the update {error}.</p>;

      case AppUpdaterStatus.UPDATE_IN_PROGRESS:
        const trimmedTotalInMB = ((downloadSizeInBytes || 0) / 1000000).toFixed(2);
        const progressInHundredths = (progressPercent || 0) / 100;
        return (
          <ProgressIndicator
            label={'Downloading...'}
            description={`${progressPercent}% of ${trimmedTotalInMB}MB`}
            percentComplete={progressInHundredths}
          />
        );

      case AppUpdaterStatus.UPDATE_SUCCEEDED:
        return <p>Composer will restart.</p>;

      case AppUpdaterStatus.UPDATE_UNAVAILABLE:
        return <p>No updates available'</p>;

      case AppUpdaterStatus.IDLE:
      default:
        return undefined;
    }
  }, [status, progressPercent]);

  const footer = useMemo(() => {
    switch (status) {
      case AppUpdaterStatus.UPDATE_AVAILABLE:
        return (
          <div>
            <DefaultButton onClick={handleDismiss} text="Cancel" />
            <PrimaryButton onClick={handleOkay} text="Okay" />
          </div>
        );

      case AppUpdaterStatus.UPDATE_FAILED:
      case AppUpdaterStatus.UPDATE_SUCCEEDED:
      case AppUpdaterStatus.UPDATE_UNAVAILABLE:
        return <PrimaryButton onClick={handleDismiss} text="Okay" />;

      case AppUpdaterStatus.UPDATE_IN_PROGRESS:
      case AppUpdaterStatus.IDLE:
      default:
        return undefined;
    }
  }, [status]);

  const showDialog = status !== AppUpdaterStatus.IDLE;

  return (
    showDialog && (
      <Dialog
        hidden={false}
        onDismiss={handleDismiss}
        dialogContentProps={{
          subText: `v${appUpdate.version}`,
          type: DialogType.normal,
          title,
        }}
        modalProps={{
          isBlocking: false,
          styles: modal,
        }}
      >
        <DialogContent>{content}</DialogContent>
        <DialogFooter>{footer}</DialogFooter>
      </Dialog>
    )
  );
};
