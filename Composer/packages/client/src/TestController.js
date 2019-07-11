/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useRef, Fragment, useContext } from 'react';
import {
  ActionButton,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Callout,
  DefaultButton,
  Stack,
} from 'office-ui-fabric-react';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import LuisStorage from './utils/luisStorage';
import { Store } from './store/index';
import { bot, botButton, calloutLabel, calloutDescription, calloutContainer } from './styles';
import { LuisConfig, Text } from './constants';
import { PublishLuisDialog } from './publishDialog';

const openInEmulator = url => {
  // this creates a temporary hidden iframe to fire off the bfemulator protocol
  // and start up the emulator
  const i = document.createElement('iframe');
  i.style.display = 'none';
  i.onload = () => i.parentNode.removeChild(i);
  i.src = `bfemulator://livechat.open?botUrl=${encodeURIComponent(url)}`;
  document.body.appendChild(i);
};

const STATE = {
  PUBLISHING: 0,
  RELOADING: 1,
  SUCCESS: 2,
};

export const TestController = () => {
  const { state, actions } = useContext(Store);
  const [modalOpen, setModalOpen] = useState(false);
  const [fetchState, setFetchState] = useState(STATE.SUCCESS);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const [error, setError] = useState({ title: '', message: '' });
  const botActionRef = useRef(null);
  const { botName, botStatus, luFiles, luStatus } = state;
  const { connectBot, reloadBot, publishLuis } = actions;
  const connected = botStatus === 'connected';

  async function handleClick() {
    const config = LuisStorage.get(botName);
    const files = luFiles.filter(f => !!f.content);
    const updated =
      luStatus.length !== luFiles.length ||
      !luStatus.every(item => {
        if (item.status === 1) return true;
        return false;
      }) ||
      config[LuisConfig.AUTHORING_KEY] === '';
    if (files.length !== 0 && updated) {
      if (config[LuisConfig.AUTHORING_KEY] === '') {
        setModalOpen(true);
        return;
      } else {
        if (await handlePublish(config)) {
          await handleLoadBot();
        }
      }
    } else {
      await handleLoadBot();
    }
  }

  async function handlePublish(config) {
    setFetchState(STATE.PUBLISHING);
    try {
      await publishLuis(config);
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
      await (connected ? reloadBot(botName) : connectBot(botName));
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
            onClick={() => openInEmulator('http://localhost:3979/api/messages')}
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
          text={connected ? formatMessage('Reload') : formatMessage('Connect')}
          onClick={handleClick}
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
              {formatMessage(error.message)}
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
        onPublish={config => {
          handlePublish(config);
          setModalOpen(false);
        }}
        botName={botName}
      />
    </Fragment>
  );
};

TestController.propTypes = {
  botStatus: PropTypes.string,
  connectBot: PropTypes.func,
  reloadBot: PropTypes.func,
  openStorageExplorer: PropTypes.func,
  openPublish: PropTypes.func,
  luFiles: PropTypes.array,
  luStatus: PropTypes.array,
};
