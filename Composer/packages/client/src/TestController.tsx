import React, { useState, useRef, Fragment, useContext, useEffect } from 'react';
import {
  ActionButton,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Callout,
  DefaultButton,
  Stack,
} from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { StoreContext } from './store';
import { bot, botButton, calloutLabel, calloutDescription, calloutContainer } from './styles';
import { LuisConfig, Text, BotStatus, DefaultSettings } from './constants';
import { PublishLuisDialog } from './publishDialog';
import { OpenAlertModal, DialogStyle } from './components/Modal';
import { getReferredFiles } from './utils/luUtil';
import { DialogInfo, OAuthInput } from './store/types';

const openInEmulator = (url, authSettings: OAuthInput) => {
  // this creates a temporary hidden iframe to fire off the bfemulator protocol
  // and start up the emulator
  const i = document.createElement('iframe');
  i.style.display = 'none';
  i.onload = () => i.parentNode && i.parentNode.removeChild(i);
  i.src = `bfemulator://livechat.open?botUrl=${encodeURIComponent(url)}&MicrosoftAppId=${
    authSettings.MicrosoftAppId
  }&MicrosoftAppPassword=${authSettings.MicrosoftAppPassword}`;
  document.body.appendChild(i);
};

const STATE = {
  PUBLISHING: 0,
  RELOADING: 1,
  SUCCESS: 2,
};

export const TestController: React.FC = () => {
  const { state, actions } = useContext(StoreContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [fetchState, setFetchState] = useState(STATE.SUCCESS);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const [error, setError] = useState({ title: '', message: '' });
  const [luisPublishSucceed, setLuisPublishSucceed] = useState(true);
  const botActionRef = useRef(null);
  const { botName, botStatus, dialogs, toStartBot, luFiles, settings } = state;
  const { connectBot, reloadBot, publishLuis, startBot, setLuisConfig } = actions;
  const connected = botStatus === BotStatus.connected;

  useEffect(() => {
    toStartBot && handleClick();
    startBot(false);
  }, [toStartBot]);

  async function handleClick() {
    const dialogErrors = dialogs.reduce<DialogInfo[]>((result, dialog) => {
      if (dialog.diagnostics.length !== 0) {
        return result.concat([dialog]);
      }
      return result;
    }, []);
    if (dialogErrors.length !== 0) {
      const title = `StaticValidationError`;
      const subTitle = dialogErrors.reduce((msg, dialog) => {
        msg += `\n In ${dialog.id}.dialog: \n ${dialog.diagnostics.join('\n')} \n`;
        return msg;
      }, '');

      OpenAlertModal(title, subTitle, {
        style: DialogStyle.Console,
      });
      return;
    }
    const config = settings ? settings.LuisConfig : null;

    if (getReferredFiles(luFiles, dialogs).length > 0) {
      if (!luisPublishSucceed || (config && config[LuisConfig.AUTHORING_KEY] === '')) {
        setModalOpen(true);
      } else {
        await publishAndReload();
      }
    } else {
      await handleLoadBot();
    }
  }

  async function publishAndReload() {
    if (await handlePublish()) {
      setLuisPublishSucceed(true);
      await handleLoadBot();
    } else {
      setLuisPublishSucceed(false);
    }
  }

  async function handlePublish() {
    setFetchState(STATE.PUBLISHING);
    try {
      await setLuisConfig(settings, botName);
      await publishLuis();
      return true;
    } catch (err) {
      setError({ title: Text.LUISDEPLOYFAILURE, message: err.message });
      setCalloutVisible(true);
      return false;
    } finally {
      setFetchState(STATE.SUCCESS);
    }
  }

  async function handleLoadBot() {
    setFetchState(STATE.RELOADING);
    try {
      await (connected ? reloadBot(settings) : connectBot(connectBot));
    } catch (err) {
      setError({ title: Text.CONNECTBOTFAILURE, message: err.message });
      setCalloutVisible(true);
    } finally {
      setFetchState(STATE.SUCCESS);
    }
  }

  return (
    <Fragment>
      <div css={bot} ref={botActionRef}>
        {connected && fetchState === STATE.SUCCESS && (
          <ActionButton
            iconProps={{
              iconName: 'OpenInNewTab',
            }}
            onClick={() =>
              openInEmulator(
                'http://localhost:3979/api/messages',
                settings ? settings.OAuthInput : DefaultSettings.OAuthInput
              )
            }
          >
            {formatMessage('Test in Emulator')}
          </ActionButton>
        )}
        {fetchState !== STATE.SUCCESS && (
          <Spinner
            size={SpinnerSize.small}
            label={fetchState === STATE.PUBLISHING ? formatMessage('Publishing') : formatMessage('Reloading')}
            ariaLive="assertive"
            labelPosition="left"
          />
        )}
        <PrimaryButton
          css={botButton}
          text={connected ? formatMessage('Restart Bot') : formatMessage('Start Bot')}
          onClick={handleClick}
          id={'publishAndConnect'}
        />
        <Callout
          role="alertdialog"
          ariaLabelledBy="callout-label-id"
          ariaDescribedBy="callout-description-id"
          gapSpace={0}
          target={botActionRef.current}
          onDismiss={() => setCalloutVisible(false)}
          setInitialFocus={true}
          hidden={!calloutVisible}
        >
          <div css={calloutContainer}>
            <p css={calloutLabel} id="callout-label-id">
              {error.title}
            </p>
            <p css={calloutDescription} id="callout-description-id">
              {error.message}
            </p>
            <Stack
              horizontal
              tokens={{
                childrenGap: 'm',
              }}
            >
              <PrimaryButton
                onClick={() => {
                  setCalloutVisible(false);
                  handleClick();
                }}
                text={formatMessage('Try again')}
              />
              <DefaultButton onClick={() => setCalloutVisible(false)} text={formatMessage('Cancel')} />
            </Stack>
          </div>
        </Callout>
      </div>
      <PublishLuisDialog
        isOpen={modalOpen}
        onDismiss={() => setModalOpen(false)}
        onPublish={() => {
          publishAndReload();
          setModalOpen(false);
        }}
        botName={botName}
      />
    </Fragment>
  );
};
