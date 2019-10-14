import React, { useContext, useEffect, useState } from 'react';
import formatMessage from 'format-message';
import TimeAgo from 'react-timeago';
import {
  PrimaryButton,
  DefaultButton,
  Icon,
  Stack,
  StackItem,
  Dialog,
  DialogFooter,
  DialogType,
} from 'office-ui-fabric-react';

import { StoreContext } from './../../../store';
import { styles } from './styles';

const DateWidget = props => {
  const { date } = props;

  const timestamp = new Date(date);

  const formattedDate = timestamp.getMonth() + 1 + '/' + timestamp.getDate() + '/' + timestamp.getFullYear();

  return (
    <span>
      {formattedDate} (<TimeAgo date={date} />)
    </span>
  );
};

export const RemotePublish = props => {
  props;
  const { state, actions } = useContext(StoreContext);
  const [dialogHidden, setDialogHidden] = useState(true);
  const [publishAction, setPublishAction] = useState('');
  const [dialogProps, setDialogProps] = useState({
    title: 'Title',
    subText: 'Sub Text',
    type: DialogType.normal,
    children: [],
  });
  const { publishVersions, botEndpoint, settings, publishStatus } = state;

  useEffect(() => {
    actions.getPublishHistory();
  }, []);

  const publish = async () => {
    setPublishAction('publish');

    // close the popup
    closeConfirm();

    // TODO: first publish editing -> integration
    // ??/

    // publish integration -> prod
    await actions.publish();
  };

  useEffect(() => {
    if (publishStatus === 'start' || publishStatus === 'inactive') {
      // noop
      // the publish has started...
    } else if (publishStatus === 'ok') {
      // reload publish history
      actions.getPublishHistory();

      if (publishAction === 'publish') {
        // display confirmation
        setDialogProps({
          title: formatMessage('Bot successfully published'),
          subText: formatMessage(
            'You can view your published bot by opening it locally in Emulator or online with Web Chat.'
          ),
          type: DialogType.normal,
          children: (
            <Stack horizontal horizontalAlign="end" gap="1rem">
              <PrimaryButton onClick={closeConfirm} text={formatMessage('OK')} />
            </Stack>
          ),
        });
      } else if (publishAction === 'rollback') {
        setDialogProps({
          title: formatMessage('Rollback successful'),
          subText: formatMessage(
            "Your bot was successfully rolled back to it's last published state.You can view your published bot by opening it locally in Emulator or online with Web Chat."
          ),
          type: DialogType.normal,
          children: (
            <Stack horizontal horizontalAlign="end" gap="1rem">
              <PrimaryButton onClick={closeConfirm} text={formatMessage('OK')} />
            </Stack>
          ),
        });
      }
      setDialogHidden(false);
    } else {
      // display confirmation
      setDialogProps({
        title: formatMessage('Error publishing bot'),
        subText: formatMessage('An error was encountered while attempting to publish your bot: { error }', {
          error: publishStatus,
        }),
        type: DialogType.normal,
        children: (
          <Stack horizontal horizontalAlign="end" gap="1rem">
            <PrimaryButton onClick={closeConfirm} text={formatMessage('OK')} />
          </Stack>
        ),
      });
      setDialogHidden(false);
    }
  }, [publishStatus]);

  const rollback = async () => {
    setPublishAction('rollback');

    // publish previousProd -> prod
    await actions.publishVersion(publishVersions.previousProduction.label);

    // reload publish history
    actions.getPublishHistory();
  };

  const openEmulator = async () => {
    await actions.getConnect('production');
    openInEmulator(
      botEndpoint,
      settings.MicrosoftAppId && settings.MicrosoftAppPassword
        ? { MicrosoftAppId: settings.MicrosoftAppId, MicrosoftAppPassword: settings.MicrosoftAppPassword }
        : { MicrosoftAppPassword: '', MicrosoftAppId: '' }
    );
  };

  const openWebchat = () => {
    alert('TODO: Open the web chat.');
  };

  const confirmRollback = () => {
    setDialogProps({
      title: formatMessage('Confirm rollback'),
      subText: formatMessage("Are you sure you want to rollback to your bot's last published state?"),
      type: DialogType.normal,
      children: (
        <Stack horizontal horizontalAlign="end" gap="1rem">
          <DefaultButton onClick={closeConfirm} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={rollback} text={formatMessage('Rollback')} />
        </Stack>
      ),
    });

    setDialogHidden(false);
  };

  const confirmPublish = () => {
    setDialogProps({
      title: formatMessage('Confirm Publish'),
      subText: formatMessage('Are you sure you want to publish your bot?'),
      type: DialogType.normal,
      children: (
        <Stack horizontal horizontalAlign="end" gap="1rem">
          <DefaultButton onClick={closeConfirm} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={publish} text={formatMessage('Publish')} />
        </Stack>
      ),
    });

    setDialogHidden(false);
  };

  const closeConfirm = () => {
    setDialogHidden(true);
  };

  const openInEmulator = (url, authSettings: { MicrosoftAppId: string; MicrosoftAppPassword: string }) => {
    // this creates a temporary hidden iframe to fire off the bfemulator protocol
    // and start up the emulator
    const i = document.createElement('iframe');
    i.style.display = 'none';
    i.onload = () => i.parentNode && i.parentNode.removeChild(i);
    i.src = `bfemulator://livechat.open?botUrl=${encodeURIComponent(url)}&msaAppId=${
      authSettings.MicrosoftAppId
    }&msaAppPassword=${encodeURIComponent(authSettings.MicrosoftAppPassword)}`;
    document.body.appendChild(i);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>Publish your bot</h1>
      {publishVersions && publishVersions.integration && (
        <div style={styles.integration}>
          <Stack horizontal gap="1rem" verticalAlign="start">
            <StackItem grow={0}>
              <Icon iconName="sync" styles={styles.icon} />
            </StackItem>
            <StackItem grow={1}>
              <h1 style={styles.h1}>In Testing</h1>
              Current version published <DateWidget date={publishVersions.integration.publishTimestamp} />
            </StackItem>
            <StackItem align="center" shrink={0} styles={styles.buttons}>
              <PrimaryButton text="Publish" onClick={confirmPublish} styles={styles.button} />
            </StackItem>
          </Stack>
        </div>
      )}
      {publishVersions && publishVersions.production && (
        <div style={styles.published}>
          <Stack horizontal gap="1rem" verticalAlign="start">
            <StackItem grow={0}>
              <Icon styles={styles.icon} iconName="Globe" />
            </StackItem>
            <StackItem grow={1}>
              <h1 style={styles.h1}>Published</h1>
              Current version published <DateWidget date={publishVersions.production.publishTimestamp} />
            </StackItem>
            <StackItem align="center" shrink={0} styles={styles.buttons}>
              <PrimaryButton
                text="Open in Emulator"
                onClick={openEmulator}
                styles={styles.button}
                style={{ marginBottom: '10px' }}
              />
              <DefaultButton onClick={openWebchat} text="Open in Web Chat" styles={styles.button} />
            </StackItem>
          </Stack>
        </div>
      )}
      <div style={styles.rollback}>
        {publishVersions && publishVersions.previousProduction && (
          <Stack horizontal gap="1rem" verticalAlign="start">
            <StackItem grow={0}>
              <Icon styles={styles.icon} iconName="history" />
            </StackItem>
            <StackItem grow={1}>
              <a href="#" onClick={confirmRollback}>
                Rollback
              </a>
              &nbsp;to last published <DateWidget date={publishVersions.previousProduction.publishTimestamp} />
            </StackItem>
          </Stack>
        )}
        {publishVersions && !publishVersions.previousProduction && (
          <Stack horizontal gap="1rem" verticalAlign="start">
            <StackItem grow={0}>
              <Icon styles={styles.disabledIcon} iconName="history" />
            </StackItem>
            <StackItem grow={1} styles={styles.disabled}>
              Rollback will be available after your next publish.
            </StackItem>
          </Stack>
        )}
      </div>
      {!publishVersions && <div>{formatMessage('Loading')}</div>}

      <Dialog hidden={dialogHidden} onDismiss={closeConfirm} dialogContentProps={dialogProps}>
        <DialogFooter>{dialogProps.children}</DialogFooter>
      </Dialog>
    </div>
  );
};
