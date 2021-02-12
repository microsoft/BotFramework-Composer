// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useCallback, useEffect, useMemo, useState, FC } from 'react';
import * as React from 'react';
import { getAccessToken, fetch, usePublishApi } from '@bfc/extension-client';
import {
  DefaultButton,
  Dropdown,
  IDropdownOption,
  ResponsiveMode,
  Spinner,
  SpinnerSize,
  PrimaryButton,
  Stack,
  Separator,
  Icon,
} from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { buttonBar as buttonBarStyles, root } from './styles';
import { Bot, BotEnvironment } from './types';
import PVABotIcon from './media/pva-bot-icon.svg';

const API_VERSION = 'v1';
const BASE_URL = `https://powerva.microsoft.com/api/botmanagement/${API_VERSION}`; // prod / sdf
const COMPOSER_1P_APP_ID = 'ce48853e-0605-4f77-8746-d70ac63cc6bc';
const PVA_PROD_1P_APP_ID = '96ff4394-9197-43aa-b393-6a41652e21f8';

const pvaBranding = '#0F677B';
const pvaBrandingHover = '#0A4A5C';
const pvaBrandingClick = '#073845';

export const PVADialog: FC = () => {
  const { closeDialog, savePublishConfig, onBack } = usePublishApi();
  const [token, setToken] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [envs, setEnvs] = useState<BotEnvironment[]>([]);
  const [env, setEnv] = useState<string | undefined>(undefined);
  const [bots, setBots] = useState<Bot[]>([]);
  const [bot, setBot] = useState<Bot | undefined>(undefined);
  const [loggingIn, setLoggingIn] = useState(false);
  const [fetchingEnvironments, setFetchingEnvironments] = useState(false);
  const [fetchingBots, setFetchingBots] = useState(false);
  const [configIsValid, setConfigIsValid] = useState(false);

  const login = useCallback(() => {
    setLoggingIn(true);
    const loginAndGetToken = async () => {
      const token = await getAccessToken({
        // web auth flow
        clientId: COMPOSER_1P_APP_ID,
        scopes: [`${PVA_PROD_1P_APP_ID}/.default`],

        // electron auth flow
        targetResource: PVA_PROD_1P_APP_ID,
      } as any); // TODO: Remove 'any' once types are fixed in @bfc/extension-client
      setLoggingIn(false);
      setToken(token);
    };
    loginAndGetToken();
  }, []);

  const pvaHeaders = useMemo(() => {
    if (token && tenantId) {
      return {
        Authorization: `Bearer ${token}`,
        'X-CCI-TenantId': tenantId,
        'X-CCI-Routing-TenantId': tenantId,
      };
    }
  }, [tenantId, token]);

  useEffect(() => {
    if (token) {
      // parse the jwt token to extract the tenant id
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      const tenantId = decodedPayload.tid;
      setTenantId(tenantId);
    }
  }, [token]);

  useEffect(() => {
    if (tenantId) {
      // get environments for tenant id
      const url = `${BASE_URL}/environments`;
      const fetchEnvs = async () => {
        setFetchingEnvironments(true);
        const res = await fetch(url, { method: 'GET', headers: pvaHeaders });
        const envs = await res.json();
        setFetchingEnvironments(false);
        setEnvs(envs);
        if (envs?.length) {
          setEnv(envs[0].id);
        }
      };
      fetchEnvs();
    }
  }, [tenantId, token, pvaHeaders]);

  const onSelectEnv = useCallback((event, item?: IDropdownOption) => {
    if (item) {
      setEnv(`${item.key}`);
    }
  }, []);

  const onSelectBot = useCallback(
    (event, item?: IDropdownOption) => {
      if (item) {
        const botId = `${item.key}`;
        const bot = bots.find((bot) => bot.id === botId);
        setBot(bot);
      }
    },
    [bots, env]
  );

  useEffect(() => {
    if (env) {
      // get bots for environment
      const url = `${BASE_URL}/environments/${encodeURIComponent(env)}/bots`;
      const fetchBots = async () => {
        setFetchingBots(true);
        const res = await fetch(url, { method: 'GET', headers: pvaHeaders });
        const bots = await res.json();
        setFetchingBots(false);
        setBots(bots);
        if (bots?.length) {
          setBot(bots[0]);
        } else {
          setBot(undefined);
        }
      };
      fetchBots();
    }
  }, [env, pvaHeaders]);

  useEffect(() => {
    if (!!env && !!bot && !!tenantId) {
      setConfigIsValid(true);
    } else {
      setConfigIsValid(false);
    }
  }, [env, bot, tenantId]);

  const onSave = useCallback(() => {
    savePublishConfig({ botId: (bot || {}).id, envId: env, tenantId, deleteMissingComponents: true });
    closeDialog();
  }, [env, bot, tenantId]);

  const loggedIn = useMemo(() => {
    return !!token && !!tenantId;
  }, [tenantId, token]);

  const envPicker = useMemo(() => {
    if (loggedIn) {
      if (!fetchingEnvironments) {
        if (envs.length) {
          const envOptions = envs.map((env) => {
            return { key: env.id, text: env.displayName };
          });
          return (
            <>
              <Dropdown
                defaultSelectedKey={envOptions[0].key}
                label={formatMessage('Environment')}
                options={envOptions}
                placeholder={formatMessage('Select an environment')}
                responsiveMode={ResponsiveMode.large}
                onChange={onSelectEnv}
              />
            </>
          );
        } else {
          return <p>{formatMessage('No environments found.')}</p>;
        }
      } else {
        return (
          <Spinner
            label={formatMessage('Fetching environments...')}
            labelPosition={'right'}
            size={SpinnerSize.medium}
            style={{ marginTop: 16, marginRight: 'auto' }}
          />
        );
      }
    }
  }, [loggedIn, fetchingEnvironments, envs]);

  const botPicker = useMemo(() => {
    if (loggedIn && !fetchingEnvironments && env) {
      if (!fetchingBots) {
        if (bots.length) {
          const botOptions = bots.map((bot) => {
            return { key: bot.id, text: bot.name };
          });
          return (
            <>
              <Dropdown
                defaultSelectedKey={botOptions[0].key}
                label={formatMessage('Bot')}
                options={botOptions}
                placeholder={formatMessage('Select a bot')}
                responsiveMode={ResponsiveMode.large}
                onChange={onSelectBot}
              />
            </>
          );
        } else {
          return <p>{formatMessage('No bots found.')}</p>;
        }
      } else {
        return (
          <Spinner
            label={formatMessage('Fetching bots...')}
            labelPosition={'right'}
            size={SpinnerSize.medium}
            style={{ marginTop: 16, marginRight: 'auto' }}
          />
        );
      }
    }
  }, [loggedIn, fetchingEnvironments, env, fetchingBots, bots]);

  const loginSplash = useMemo(() => {
    if (!loggedIn) {
      const loginButton = loggingIn ? (
        <Spinner
          label={formatMessage('Logging in...')}
          labelPosition={'right'}
          size={SpinnerSize.medium}
          style={{ marginTop: 16 }}
        />
      ) : (
        <PrimaryButton
          styles={{
            root: { backgroundColor: pvaBranding, marginTop: 20, border: 0, maxWidth: 200 },
            rootHovered: { backgroundColor: pvaBrandingHover, border: 0 },
            rootPressed: { backgroundColor: pvaBrandingClick, border: 0 },
          }}
          onClick={login}
        >
          {formatMessage('Login to proceed')}{' '}
          <Icon color={'#FFF'} iconName={'ChevronRight'} styles={{ root: { fontSize: '11px', marginLeft: 10 } }} />
        </PrimaryButton>
      );
      return (
        <Stack horizontalAlign={'center'}>
          <p
            style={{
              width: '100%',
              textAlign: 'center',
              backgroundColor: pvaBranding,
              padding: '8px 0',
              color: '#FFF',
              fontWeight: 500,
            }}
          >
            {formatMessage('Power Virtual Agents')}
          </p>
          <Separator styles={{ root: { width: '50%' } }} />
          <p style={{ textAlign: 'center', fontWeight: 500 }}>
            {formatMessage('Publish your bot assets from Composer directly into Power Virtual Agents.')}
          </p>
          <i
            style={{
              display: 'inline-block',
              bottom: 0,
              left: 0,
              width: 30,
              height: 30,
              backgroundImage: `url("${PVABotIcon}")`,
            }}
          ></i>
          <Stack horizontalAlign={'start'}>
            <p>{formatMessage('1. Select an environment containing your bot')}</p>
            <p>{formatMessage('2. Select the bot you wish to publish to')}</p>
          </Stack>
          {loginButton}
        </Stack>
      );
    }
  }, [loggedIn, loggingIn]);

  const buttonBar = useMemo(() => {
    if (loggedIn) {
      return (
        <div style={buttonBarStyles}>
          <DefaultButton
            styles={{
              root: { marginLeft: 'auto' },
            }}
            text="Back"
            onClick={onBack}
          />
          <PrimaryButton
            disabled={!configIsValid}
            styles={{
              root: { marginLeft: 8 },
            }}
            text="Save"
            onClick={onSave}
          />
        </div>
      );
    }
  }, [configIsValid, loggedIn]);

  return (
    <div style={root}>
      {loginSplash}
      {envPicker}
      {botPicker}
      {buttonBar}
    </div>
  );
};
