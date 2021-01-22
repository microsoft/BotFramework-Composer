// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { navigate, RouteComponentProps } from '@reach/router';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { ExternalContentProviderType } from '@botframework-composer/types';
import { useRecoilValue } from 'recoil';
import axios from 'axios';

import { dispatcherState } from '../../recoilModel';
import { createNotification } from '../../recoilModel/dispatchers/notification';

import { ImportStatus } from './ImportStatus';
import { ImportSuccessNotificationWrapper } from './ImportSuccessNotification';
import { ImportPromptToSaveModal } from './ImportPromptToSaveModal';
import { ImportFailedModal } from './ImportFailedModal';

type ImportedProjectInfo = {
  alias?: string;
  description?: string;
  eTag: string;
  name?: string;
  source: string;
  templateDir: string;
  urlSuffix?: string;
};

type ImportPayload = {
  name: string;
  description?: string;
};

type ExistingProjectInfo = {
  id: string;
  location: string;
  name: string;
};

type ImportModalState =
  | 'copyingContent' // after selecting import to existing project
  | 'connecting' // before login prompt shows
  | 'downloadingContent' // after logging in
  | 'failed' // error
  | 'promptingToSave' // when an existing project is found under the same alias
  | 'signingIn'; // when login prompt is showing

const CONNECTING_STATUS_DISPLAY_TIME = 2000;

export const ImportModal: React.FC<RouteComponentProps> = (props) => {
  const { location } = props;
  const [importSource, setImportSource] = useState<ExternalContentProviderType | undefined>(undefined);
  const [importPayload, setImportPayload] = useState<ImportPayload>({ name: '', description: '' });
  const [importedProjectInfo, setImportedProjectInfo] = useState<ImportedProjectInfo | undefined>(undefined);
  const [modalState, setModalState] = useState<ImportModalState>('connecting');
  const [existingProject, setExistingProject] = useState<ExistingProjectInfo | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [backupLocation, setBackupLocation] = useState<string>('');
  const { addNotification } = useRecoilValue(dispatcherState);

  const importAsNewProject = useCallback((info: ImportedProjectInfo) => {
    // navigate to creation flow with template selected
    const { alias, description, eTag, name, source, templateDir, urlSuffix } = info;
    const state = {
      alias,
      eTag,
      imported: true,
      templateDir,
      urlSuffix,
    };

    let creationUrl = `/projects/create/${encodeURIComponent(source)}`;

    const searchParams = new URLSearchParams();
    if (name) {
      searchParams.set('name', encodeURIComponent(name));
    }
    if (description) {
      searchParams.set('description', encodeURIComponent(description));
    }
    if (searchParams.toString()) {
      creationUrl += `?${searchParams.toString()}`;
    }

    navigate(creationUrl, { state });
  }, []);

  const importToExistingProject = useCallback(async () => {
    if (importedProjectInfo && existingProject) {
      setModalState('copyingContent');
      try {
        // call server to do backup and then save to existing project
        let res = await axios.post<{ path: string }>(`/api/projects/${existingProject.id}/backup`);
        const { path } = res.data;
        setBackupLocation(path);

        const { eTag, templateDir } = importedProjectInfo;
        res = await axios.post(
          `/api/projects/${existingProject.id}/copyTemplateToExisting`,
          { eTag, templateDir },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // open project and create a notification saying that import was complete
        if (res.status === 200) {
          const notification = createNotification({
            type: 'success',
            title: '',
            onRenderCardContent: ImportSuccessNotificationWrapper({
              importedToExisting: true,
              location: path,
            }),
          });
          addNotification(notification);
          navigate(`/bot/${existingProject?.id}`);
        } else {
          const err = res.data ? res.data : res.statusText;
          throw err;
        }
      } catch (e) {
        console.error('Something went wrong while saving bot to existing project: ', e);
        setError(e);
        setModalState('failed');
      }
    }
  }, [existingProject, importedProjectInfo]);

  useEffect(() => {
    if (modalState === 'downloadingContent') {
      const importBotContent = async () => {
        if (location?.href) {
          try {
            const { description, name } = importPayload;

            const res = await axios.post<{ alias: string; eTag: string; templateDir: string; urlSuffix: string }>(
              `/api/import/${importSource}?payload=${encodeURIComponent(JSON.stringify(importPayload))}`
            );
            const { alias, eTag, templateDir, urlSuffix } = res.data;
            const projectInfo = {
              description,
              name,
              templateDir,
              urlSuffix,
              eTag,
              source: importSource as ExternalContentProviderType,
              alias,
            };
            setImportedProjectInfo(projectInfo);

            if (alias) {
              // check to see if Composer currently has a bot project corresponding to the alias
              const aliasRes = await axios.get<any>(`/api/projects/alias/${alias}`, {
                validateStatus: (status) => {
                  // a 404 should fall through
                  if (status === 404) {
                    return true;
                  }
                  return status >= 200 && status < 300;
                },
              });
              if (aliasRes.status === 200) {
                const project = aliasRes.data;
                setExistingProject(project);
                // ask user if they want to save to existing, or save as a new project
                setModalState('promptingToSave');
                return;
              }
            }
            importAsNewProject(projectInfo);
          } catch (e) {
            // something went wrong, abort and navigate to the home page
            console.error(`Something went wrong during import: ${e}`);
            navigate('/home');
          }
        }
      };
      importBotContent();
    }
  }, [modalState, importPayload, importSource]);

  useEffect(() => {
    if (modalState === 'signingIn') {
      const signIn = async () => {
        try {
          await axios.post(
            `/api/import/${importSource}/authenticate?payload=${encodeURIComponent(JSON.stringify(importPayload))}`
          );
          setModalState('downloadingContent');
        } catch (e) {
          // something went wrong, abort and navigate to the home page
          console.error(`Something went wrong during authenticating import: ${e}`);
          navigate('/home');
        }
      };
      signIn();
    }
  }, [modalState, importSource, importPayload]);

  useEffect(() => {
    if (location?.href) {
      try {
        // parse data from url and store in state
        const url = new URL(location.href);
        const source = url.searchParams.get('source');
        const payload = url.searchParams.get('payload');
        if (!source || !payload) {
          throw new Error('Missing source or payload.');
        }
        setImportSource(source as ExternalContentProviderType);
        setImportPayload(JSON.parse(payload));
        setTimeout(() => {
          setModalState('signingIn');
        }, CONNECTING_STATUS_DISPLAY_TIME);
      } catch (e) {
        console.error('Aborting import: ', e);
        navigate('/home');
      }
    }
  }, []);

  const cancel = useCallback(() => {
    navigate('/home');
  }, []);

  const openExistingProject = useCallback(() => {
    if (existingProject) {
      navigate(`/bot/${existingProject.id}`);
    }
  }, [existingProject]);

  const createNewProxy = useCallback(() => {
    if (importedProjectInfo) {
      importAsNewProject(importedProjectInfo);
    }
  }, [importedProjectInfo, importAsNewProject]);

  const modalContent = useMemo(() => {
    switch (modalState) {
      case 'connecting':
        return <ImportStatus source={importSource} state={'connecting'} />;

      case 'downloadingContent':
        return <ImportStatus botName={importPayload.name} source={importSource} state={'downloading'} />;

      case 'copyingContent':
      case 'promptingToSave': {
        const isCopyingContent = modalState === 'copyingContent';
        return (
          <ImportPromptToSaveModal
            existingProjectName={existingProject?.name}
            isCopyingContent={isCopyingContent}
            onDismiss={cancel}
            onImportAsNew={createNewProxy}
            onUpdate={importToExistingProject}
          />
        );
      }

      case 'failed':
        return <ImportFailedModal botName={importPayload.name} error={error} onDismiss={cancel} />;

      case 'signingIn':
        // block but don't show anything other than the login window
        return (
          <Dialog
            dialogContentProps={{ type: DialogType.normal }}
            hidden={false}
            modalProps={{ isBlocking: true }}
            styles={{ main: { display: 'none' } }}
          />
        );

      default:
        throw new Error(`ImportModal trying to render for unexpected state: ${modalState}`);
    }
  }, [
    modalState,
    existingProject,
    error,
    openExistingProject,
    backupLocation,
    importedProjectInfo,
    importPayload,
    importSource,
  ]);

  return modalContent;
};
