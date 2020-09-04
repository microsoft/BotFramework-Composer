// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useEffect } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { useRecoilValue } from 'recoil';

import {
  projectIdState,
  localeState,
  showAddLanguageModalState,
  showDelLanguageModalState,
  settingsState,
} from '../../recoilModel/atoms/botState';
import { dispatcherState } from '../../recoilModel';
import { TestController } from '../../components/TestController/TestController';
import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { navigateTo } from '../../utils/navigation';
import { Page } from '../../components/Page';
import { INavTreeItem } from '../../components/NavTree';
import { useLocation } from '../../utils/hooks';
import { IToolbarItem } from '../../components/Toolbar';
import { AddLanguageModal, DeleteLanguageModal } from '../../components/MultiLanguage/index';
import { useProjectIdCache } from '../../utils/hooks';

import { SettingsRoutes } from './router';

const getProjectLink = (path: string, id?: string) => {
  return id ? `/settings/bot/${id}/${path}` : `/settings/${path}`;
};

const SettingPage: React.FC<RouteComponentProps<{ '*': string }>> = () => {
  const {
    deleteBotProject,
    addLanguageDialogBegin,
    addLanguageDialogCancel,
    delLanguageDialogBegin,
    delLanguageDialogCancel,
    addLanguages,
    deleteLanguages,
    fetchProjectById,
  } = useRecoilValue(dispatcherState);
  const projectId = useRecoilValue(projectIdState);
  const locale = useRecoilValue(localeState);
  const showAddLanguageModal = useRecoilValue(showAddLanguageModalState);
  const showDelLanguageModal = useRecoilValue(showDelLanguageModalState);
  const { defaultLanguage, languages } = useRecoilValue(settingsState);
  const { navigate } = useLocation();

  // when fresh page, projectId in store are empty, no project are opened at client
  // use cached projectId do fetch.
  const cachedProjectId = useProjectIdCache();
  useEffect(() => {
    if (!projectId && cachedProjectId) {
      fetchProjectById(cachedProjectId);
    }
  }, []);

  // If no project is open and user tries to access a bot-scoped settings (e.g., browser history, deep link)
  // Redirect them to the default settings route that is not bot-scoped
  useEffect(() => {
    if (!projectId && location.pathname.indexOf('/settings/bot/') !== -1) {
      navigate('/settings/application');
    }
  }, [projectId]);

  const settingLabels = {
    botSettings: formatMessage('Bot Settings'),
    appSettings: formatMessage('Application Settings'),
    runtime: formatMessage('Runtime Config'),
    plugins: formatMessage('Plugins'),
    about: formatMessage('About'),
  };

  const links: INavTreeItem[] = [
    {
      id: 'dialog-settings',
      name: settingLabels.botSettings,
      url: getProjectLink('dialog-settings', projectId),
      disabled: !projectId,
    },
    { id: 'application', name: settingLabels.appSettings, url: getProjectLink('application') },
    { id: 'runtime', name: settingLabels.runtime, url: getProjectLink('runtime', projectId), disabled: !projectId },
    // { id: 'plugins', name: settingLabels.plugins, url: getProjectLink('plugins') },
    { id: 'about', name: settingLabels.about, url: getProjectLink('about') },
  ];

  const openDeleteBotModal = async () => {
    const boldWarningText = formatMessage(
      'Warning: the action you are about to take cannot be undone. Going further will delete this bot and any related files in the bot project folder.'
    );
    const warningText = formatMessage('External resources will not be changed.');
    const title = formatMessage('Delete Bot');
    const checkboxLabel = formatMessage('I want to delete this bot');
    const settings = {
      onRenderContent: () => {
        return (
          <div
            style={{
              background: '#ffddcc',
              display: 'flex',
              flexDirection: 'row',
              marginBottom: '24px',
            }}
          >
            <FontIcon
              iconName="Warning12"
              style={{
                color: '#DD4400',
                fontSize: 36,
                padding: '32px',
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Text
                block
                style={{
                  fontWeight: 'bold',
                  marginTop: '24px',
                  marginRight: '24px',
                  marginBottom: '24px',
                }}
              >
                {boldWarningText}
              </Text>
              <Text
                block
                style={{
                  marginRight: '24px',
                  marginBottom: '24px',
                }}
              >
                {warningText}
              </Text>
            </div>
          </div>
        );
      },
      disabled: true,
      checkboxLabel,
      confirmBtnText: formatMessage('Delete'),
    };
    const res = await OpenConfirmModal(title, null, settings);
    if (res) {
      await deleteBotProject(projectId);
      navigateTo('home');
    }
  };

  const onAddLangModalSubmit = async (formData) => {
    await addLanguages({
      ...formData,
      projectId,
    });
  };

  const onDeleteLangModalSubmit = async (formData) => {
    await deleteLanguages({
      ...formData,
      projectId,
    });
  };

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'dropdown',
      text: formatMessage('Edit'),
      align: 'left',
      dataTestid: 'EditFlyout',
      buttonProps: {
        iconProps: { iconName: 'Edit' },
      },
      menuProps: {
        items: [
          {
            key: 'edit.deleteBot',
            text: formatMessage('Delete Bot'),
            onClick: openDeleteBotModal,
          },
          {
            key: 'edit.deleteLanguage',
            text: formatMessage('Delete language'),
            onClick: () => {
              delLanguageDialogBegin(() => {});
            },
          },
        ],
      },
    },

    {
      type: 'action',
      text: formatMessage('Add language'),
      buttonProps: {
        iconProps: {
          iconName: 'CirclePlus',
        },
        onClick: () => {
          addLanguageDialogBegin(() => {});
        },
      },
      align: 'left',
      dataTestid: 'AddLanguageFlyout',
      disabled: false,
    },

    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  const title = useMemo(() => {
    const page = links.find((l) => location.pathname.includes(l.url));
    if (page) {
      return page.name;
    }

    return settingLabels.appSettings;
  }, [location.pathname]);

  return (
    <Page
      mainRegionName={formatMessage('Settings editor')}
      navLinks={links}
      navRegionName={formatMessage('Settings menu')}
      title={title}
      toolbarItems={toolbarItems}
    >
      <AddLanguageModal
        defaultLanguage={defaultLanguage}
        isOpen={showAddLanguageModal}
        languages={languages}
        locale={locale}
        onDismiss={addLanguageDialogCancel}
        onSubmit={onAddLangModalSubmit}
      ></AddLanguageModal>
      <DeleteLanguageModal
        defaultLanguage={defaultLanguage}
        isOpen={showDelLanguageModal}
        languages={languages}
        locale={locale}
        onDismiss={delLanguageDialogCancel}
        onSubmit={onDeleteLangModalSubmit}
      ></DeleteLanguageModal>
      <SettingsRoutes projectId={projectId} />
    </Page>
  );
};

export default SettingPage;
