// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useEffect } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';

import {
  dispatcherState,
  localeState,
  showDelLanguageModalState,
  showAddLanguageModalState,
  settingsState,
  currentProjectIdState,
} from '../../recoilModel';
import { Page } from '../../components/Page';
import { INavTreeItem } from '../../components/NavTree';
import { useLocation } from '../../utils/hooks';
import { AddLanguageModal, DeleteLanguageModal } from '../../components/MultiLanguage/index';
import { useProjectIdCache } from '../../utils/hooks';

import { SettingsRoutes } from './router';

const header = css`
  padding: 5px 20px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  justify-content: space-between;
  label: PageHeader;
`;

const getProjectLink = (path: string, id?: string) => {
  return id ? `/settings/bot/${id}/${path}` : `/settings/${path}`;
};

const SettingPage: React.FC<RouteComponentProps> = () => {
  const {
    addLanguageDialogCancel,
    delLanguageDialogCancel,
    addLanguages,
    deleteLanguages,
    fetchProjectById,
  } = useRecoilValue(dispatcherState);
  const projectId = useRecoilValue(currentProjectIdState);
  const locale = useRecoilValue(localeState(projectId));
  const showDelLanguageModal = useRecoilValue(showDelLanguageModalState(projectId));
  const showAddLanguageModal = useRecoilValue(showAddLanguageModalState(projectId));
  const settings = useRecoilValue(settingsState(projectId));
  const { defaultLanguage, languages } = settings;

  const { navigate } = useLocation();

  // when fresh page, projectId in store are empty, no project are opened at client
  // use cached projectId do fetch.
  const cachedProjectId = useProjectIdCache();
  useEffect(() => {
    if (!projectId && cachedProjectId) {
      fetchProjectById(cachedProjectId);
    }
  }, []);

  const settingLabels = {
    botSettings: formatMessage('Bot Settings'),
    appSettings: formatMessage('Application Settings'),
    runtime: formatMessage('Runtime Config'),
    about: formatMessage('About'),
  };

  const links: INavTreeItem[] = [
    { id: 'application', name: settingLabels.appSettings, url: getProjectLink('application') },
    { id: 'about', name: settingLabels.about, url: getProjectLink('about') },
  ];

  // If no project is open and user tries to access a bot-scoped settings (e.g., browser history, deep link)
  // Redirect them to the default settings route that is not bot-scoped
  useEffect(() => {
    if (!projectId && location.pathname.indexOf('/settings/bot/') !== -1) {
      navigate('/settings/application');
    }
  }, [projectId]);

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

  const title = useMemo(() => {
    const page = links.find((l) => location.pathname.includes(l.url));
    if (page) {
      return page.name;
    }

    return settingLabels.appSettings;
  }, [location.pathname]);

  const onRenderHeaderContent = () => {
    return formatMessage(
      'This Page contains detailed information about your bot. For security reasons, they are hidden by default. To test your bot or publish to Azure, you may need to provide these settings'
    );
  };

  return (
    <Page
      headerStyle={header}
      mainRegionName={formatMessage('Settings editor')}
      navLinks={links}
      navRegionName={formatMessage('Settings menu')}
      pageMode={'settings'}
      title={title}
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <AddLanguageModal
        defaultLanguage={defaultLanguage}
        isOpen={showAddLanguageModal}
        languages={languages}
        locale={locale}
        onDismiss={() => addLanguageDialogCancel(projectId)}
        onSubmit={onAddLangModalSubmit}
      ></AddLanguageModal>
      <DeleteLanguageModal
        defaultLanguage={defaultLanguage}
        isOpen={showDelLanguageModal}
        languages={languages}
        locale={locale}
        onDismiss={() => delLanguageDialogCancel(projectId)}
        onSubmit={onDeleteLangModalSubmit}
      ></DeleteLanguageModal>
      <SettingsRoutes projectId={projectId} />
    </Page>
  );
};

export default SettingPage;
