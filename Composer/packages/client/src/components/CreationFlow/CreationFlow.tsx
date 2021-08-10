// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Path from 'path';

import React, { useEffect, useRef, Fragment, useState } from 'react';
import { RouteComponentProps, Router, navigate } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { BotTemplate } from '@bfc/shared';

import { CreationFlowStatus, firstPartyTemplateFeed } from '../../constants';
import {
  dispatcherState,
  creationFlowStatusState,
  storagesState,
  focusedStorageFolderState,
  currentProjectIdState,
  userSettingsState,
  templateProjectsState,
  selectedTemplateVersionState,
  templateFeedsState,
} from '../../recoilModel';
import { localBotsDataSelector } from '../../recoilModel/selectors/project';
import Home from '../../pages/home/Home';
import { useProjectIdCache } from '../../utils/hooks';
import { ImportModal } from '../ImportModal/ImportModal';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { OpenProject } from './OpenProject';
import { CreateOptions } from './CreateOptions';
import DefineConversation from './DefineConversation';

type CreationFlowProps = RouteComponentProps<{}>;

const CreationFlow: React.FC<CreationFlowProps> = () => {
  const {
    fetchTemplates,
    fetchStorages,
    fetchFolderItemsByPath,
    setCreationFlowStatus,
    createFolder,
    updateCurrentPathForStorage,
    updateFolder,
    saveTemplateId,
    fetchRecentProjects,
    fetchFeed,
    openProject,
    saveProjectAs,
    migrateProjectTo,
    fetchProjectById,
    createNewBot,
    fetchReadMe,
  } = useRecoilValue(dispatcherState);

  const templateFeeds = useRecoilValue(templateFeedsState);
  const templateProjects = useRecoilValue(templateProjectsState);
  const creationFlowStatus = useRecoilValue(creationFlowStatusState);
  const projectId = useRecoilValue(currentProjectIdState);
  const storages = useRecoilValue(storagesState);
  const botProjects = useRecoilValue(localBotsDataSelector);
  const botProject = botProjects.find((b) => b.projectId === projectId);
  const focusedStorageFolder = useRecoilValue(focusedStorageFolderState);
  const { appLocale } = useRecoilValue(userSettingsState);
  const cachedProjectId = useProjectIdCache();
  const currentStorageIndex = useRef(0);
  const storage = storages[currentStorageIndex.current];
  const currentStorageId = storage ? storage.id : 'default';
  const [localTemplatePath, setLocalTemplatePath] = useState('');
  const selectedTemplateVersion = useRecoilValue(selectedTemplateVersionState);

  useEffect(() => {
    if (storages?.length) {
      const storageId = storage.id;
      const path = storage.path;
      const formattedPath = Path.normalize(path);
      fetchFolderItemsByPath(storageId, formattedPath);
    }
  }, [storages]);

  const fetchResources = async () => {
    // fetchProject use `gotoSnapshot` which will wipe out all state value.
    // so here make those methods call in sequence.

    if (!projectId && cachedProjectId) {
      await fetchProjectById(cachedProjectId);
    }
    await fetchStorages();
    fetchFeed();
    fetchRecentProjects();
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    const templateFeedUrls = Array.from(templateFeeds).map((feedObj) => {
      return feedObj.url;
    });
    fetchTemplates(templateFeedUrls);
  }, [templateFeeds]);

  const updateCurrentPath = async (newPath, storageId) => {
    if (!storageId) {
      storageId = currentStorageId;
    }
    if (newPath) {
      const formattedPath = Path.normalize(newPath);
      updateCurrentPathForStorage(formattedPath, storageId);
    }
  };

  const handleDismiss = () => {
    setLocalTemplatePath('');
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    navigate(`/home`);
  };

  const handleJumpToOpenModal = (search) => {
    setCreationFlowStatus(CreationFlowStatus.OPEN);
    navigate(`./open${search}`);
  };

  const openBot = async (formData) => {
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
    await openProject(
      formData.path,
      'default',
      true,
      { profile: formData.profile, source: formData.source, alias: formData.alias },
      (projectId) => {
        TelemetryClient.track('BotProjectOpened', { method: 'toolbar', projectId });
      }
    );
  };

  const handleCreateNew = async (formData, templateId: string, qnaKbUrls?: string[]) => {
    const templateVersion =
      selectedTemplateVersion ??
      templateProjects.find((template: BotTemplate) => {
        return template.id == templateId;
      })?.package?.packageVersion;
    const newBotData = {
      templateId: templateId || '',
      templateVersion: templateVersion || '',
      name: formData.name,
      description: formData.description,
      location: formData.location,
      schemaUrl: formData.schemaUrl,
      runtimeType: formData.runtimeType,
      runtimeLanguage: formData.runtimeLanguage,
      appLocale,
      qnaKbUrls,
      templateDir: formData?.pvaData?.templateDir,
      eTag: formData?.pvaData?.eTag,
      urlSuffix: formData?.pvaData?.urlSuffix,
      preserveRoot: formData?.pvaData?.preserveRoot,
      alias: formData?.alias,
      profile: formData?.profile,
      source: formData?.source,
      isLocalGenerator: formData?.isLocalGenerator,
    };
    TelemetryClient.track('CreateNewBotProjectStarted', { template: templateId });

    createNewBot(newBotData);
  };

  const handleSaveAs = (formData) => {
    saveProjectAs(projectId, formData.name, formData.description, formData.location);
  };

  const handleMigrate = (formData) => {
    handleDismiss();
    setCreationFlowStatus(CreationFlowStatus.MIGRATE);
    migrateProjectTo(
      projectId,
      formData.name,
      formData.description,
      formData.location,
      formData.runtimeLanguage,
      formData.runtimeType
    );
  };

  const handleSubmit = async (formData, templateId: string) => {
    handleDismiss();
    switch (creationFlowStatus) {
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        break;
      case CreationFlowStatus.MIGRATE:
        handleMigrate(formData);
        break;
      default:
        saveTemplateId(templateId);
        await handleCreateNew(formData, templateId);
    }
  };

  const handleCreateNext = async (templateName: string, runtimeLanguage: string, urlData?: string) => {
    setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
    const navString = urlData
      ? `./create/${runtimeLanguage}/${encodeURIComponent(templateName)}${urlData}`
      : `./create/${runtimeLanguage}/${encodeURIComponent(templateName)}`;
    navigate(navString);
  };

  return (
    <Fragment>
      <Home />
      <Router>
        <DefineConversation
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          localTemplatePath={localTemplatePath}
          path="create/:runtimeLanguage/:templateId"
          updateFolder={updateFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={() => {
            TelemetryClient.track('CreationCancelled');
            handleDismiss();
          }}
          onSubmit={handleSubmit}
        />
        <DefineConversation
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          path="create/:templateId"
          updateFolder={updateFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={() => {
            TelemetryClient.track('CreationCancelled');
            handleDismiss();
          }}
          onSubmit={handleSubmit}
        />
        <CreateOptions
          fetchReadMe={fetchReadMe}
          localTemplatePath={localTemplatePath}
          path="create"
          templates={templateProjects}
          onDismiss={() => {
            TelemetryClient.track('CreationCancelled');
            handleDismiss();
          }}
          onJumpToOpenModal={handleJumpToOpenModal}
          onNext={handleCreateNext}
          onUpdateLocalTemplatePath={setLocalTemplatePath}
        />
        <DefineConversation
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          path=":projectId/:templateId/save"
          updateFolder={updateFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onSubmit={handleSubmit}
        />
        <OpenProject
          focusedStorageFolder={focusedStorageFolder}
          path="open"
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onOpen={openBot}
        />
        <DefineConversation
          createFolder={createFolder}
          focusedStorageFolder={focusedStorageFolder}
          path="migrate/:projectId"
          templateId={botProject?.name || 'migrated_project'} // templateId is used for default project name
          updateFolder={updateFolder}
          onCurrentPathUpdate={updateCurrentPath}
          onDismiss={handleDismiss}
          onSubmit={handleMigrate}
        />
        <ImportModal path="import" />
      </Router>
    </Fragment>
  );
};

export default CreationFlow;
