/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { navigate, RouteComponentProps } from '@reach/router';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { ImportStatus } from './ImportStatus';
import { useRecoilValue } from 'recoil';
import { dispatcherState } from '../../recoilModel';
import { createNotification } from '../../recoilModel/dispatchers/notification';
import { ImportSuccessNotification } from './ImportSuccessNotification';
import { getUserFriendlySource } from './getUserFriendlySource';

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

const boldText = css`
  font-weight: ${FontWeights.semibold};
  color: #106ebe;
  word-break: break-work;
`;

const CONNECTING_STATUS_DISPLAY_TIME = 2000;

export const ImportModal: React.FC<RouteComponentProps> = (props) => {
  const { location } = props;
  const [importSource, setImportSource] = useState<string>('');
  const [importPayload, setImportPayload] = useState<ImportPayload>({ name: '', description: '' });
  const [importedProjectInfo, setImportedProjectInfo] = useState<ImportedProjectInfo | undefined>(undefined);
  const [modalState, setModalState] = useState<ImportModalState>('connecting');
  const [existingProject, setExistingProject] = useState<ExistingProjectInfo | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);
  const [backupLocation, setBackupLocation] = useState<string>('');
  const { addNotification } = useRecoilValue(dispatcherState);

  const importAsNewProject = useCallback((info: ImportedProjectInfo) => {
    // navigate to creation flow with template selected
    const { alias, description, eTag, name, source, templateDir, urlSuffix } = info;
    let creationUrl = `/projects/create/${encodeURIComponent(source)}?imported=true&templateDir=${encodeURIComponent(
      templateDir
    )}&eTag=${encodeURIComponent(eTag)}&source=${encodeURIComponent(source)}`;

    if (name) {
      creationUrl += `&name=${encodeURIComponent(name)}`;
    }
    if (description) {
      creationUrl += `&description=${encodeURIComponent(description)}`;
    }
    if (urlSuffix) {
      creationUrl += `&urlSuffix=${encodeURIComponent(urlSuffix)}`;
    }
    if (alias) {
      creationUrl += `&alias=${encodeURIComponent(alias)}`;
    }

    navigate(creationUrl);
  }, []);

  const importToExistingProject = useCallback(() => {
    if (importedProjectInfo && existingProject) {
      setModalState('copyingContent');

      const backupAndSave = async () => {
        try {
          // call server to do backup and then save to existing project
          let res = await fetch(`/api/projects/${existingProject.id}/backup`, { method: 'POST' });
          const { path } = await res.json();
          setBackupLocation(path);

          const { eTag, templateDir } = importedProjectInfo;
          res = await fetch(`/api/projects/${existingProject.id}/copyTemplateToExisting`, {
            method: 'POST',
            body: JSON.stringify({ eTag, templateDir }),
            headers: { 'Content-Type': 'application/json' },
          });

          // open project and create a notification saying that import was complete
          if (res.status === 200) {
            const notification = createNotification({
              type: 'success',
              title: '',
              onRenderCardContent: ImportSuccessNotification({
                botName: existingProject.name,
                importedToExisting: true,
                location: existingProject.location,
                serviceName: getUserFriendlySource(importSource),
              }),
            });
            addNotification(notification);
            navigate(`/bot/${existingProject?.id}`);
          } else {
            const err = await res.json();
            throw err;
          }
        } catch (e) {
          console.error('Something went wrong while saving bot to existing project: ', e);
          setError(e);
          setModalState('failed');
        }
      };
      backupAndSave();
    }
  }, [existingProject, importedProjectInfo]);

  useEffect(() => {
    if (modalState === 'downloadingContent') {
      const importBotContent = async () => {
        if (location && location.href) {
          try {
            const { description, name } = importPayload;

            let res = await fetch(
              `/api/import/${importSource}?payload=${encodeURIComponent(JSON.stringify(importPayload))}`,
              {
                method: 'POST',
              }
            );
            if (res.status !== 200) {
              throw `Something went wrong during import: ${res.status} ${res.statusText}`;
            }
            const data = await res.json();
            const { alias, eTag, templateDir, urlSuffix } = data;
            const projectInfo = { description, name, templateDir, urlSuffix, eTag, source: importSource, alias };
            setImportedProjectInfo(projectInfo);

            if (alias) {
              // check to see if Composer currently has a bot project corresponding to the alias
              res = await fetch(`/api/projects/alias/${alias}`, { method: 'GET' });
              if (res.status === 200) {
                const project = await res.json();
                setExistingProject(project);
                // ask user if they want to save to existing, or save as a new project
                setModalState('promptingToSave');
                return;
              }
            }
            importAsNewProject(projectInfo);
          } catch (e) {
            // something went wrong, abort and navigate to the home page
            console.error(`Aborting import: ${e}`);
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
          const res = await fetch(
            `/api/import/${importSource}/authenticate?payload=${encodeURIComponent(JSON.stringify(importPayload))}`,
            {
              method: 'POST',
            }
          );
          if (res.status !== 200) {
            throw `Something went wrong during authenticating import: ${res.status} ${res.statusText}`;
          }
          setModalState('downloadingContent');
        } catch (e) {
          // something went wrong, abort and navigate to the home page
          console.error(`Aborting import: ${e}`);
          navigate('/home');
        }
      };
      signIn();
    }
  }, [modalState, importSource, importPayload]);

  useEffect(() => {
    if (location && location.href) {
      try {
        // parse data from url and store in state
        const url = new URL(location.href);
        const source = url.searchParams.get('source');
        const payload = url.searchParams.get('payload');
        if (!source || !payload) {
          throw 'Missing source or payload.';
        }
        setImportSource(source);
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
    console.log('Cancelled import.');
    navigate('/home');
  }, []);

  const openExistingProject = useCallback(() => {
    navigate(`/bot/${existingProject?.id}`);
  }, [existingProject]);

  const createNewProxy = useCallback(() => {
    if (importedProjectInfo) {
      importAsNewProject(importedProjectInfo);
    }
  }, [importedProjectInfo]);

  const modalContent = useMemo(() => {
    switch (modalState) {
      case 'connecting':
        return <ImportStatus state={'connecting'} source={importSource} />;

      case 'downloadingContent':
        return <ImportStatus state={'downloading'} botName={importPayload.name} source={importSource} />;

      case 'copyingContent':
      case 'promptingToSave':
        const dialogTitle = (
          <span>
            {formatMessage('Do you want to update ')}
            <span css={boldText}>{existingProject?.name}</span>
          </span>
        );
        const isCopyingContent = modalState === 'copyingContent';
        return (
          <Dialog
            hidden={false}
            dialogContentProps={{ title: dialogTitle, type: DialogType.close }}
            minWidth={560}
            onDismiss={cancel}
          >
            <p style={{ fontSize: 16 }}>
              {formatMessage('Updating ')}
              {existingProject?.name}
              {formatMessage(' will overwrite the current bot content and create a backup.')}
            </p>
            <DialogFooter
              styles={{ actionsRight: { display: 'flex', justifyContent: 'flex-end' }, action: { display: 'flex' } }}
            >
              {isCopyingContent && (
                <Spinner
                  labelPosition={'left'}
                  label={formatMessage('Setting things up...')}
                  size={SpinnerSize.small}
                />
              )}
              <PrimaryButton
                disabled={isCopyingContent}
                text={formatMessage('Update')}
                onClick={importToExistingProject}
              />
              <DefaultButton
                disabled={isCopyingContent}
                text={formatMessage('Import as new')}
                onClick={createNewProxy}
              />
            </DialogFooter>
          </Dialog>
        );

      case 'failed':
        return (
          <Dialog
            hidden={false}
            dialogContentProps={{
              title: formatMessage('Something went wrong'),
              type: DialogType.close,
            }}
            minWidth={560}
            onDismiss={cancel}
          >
            <p style={{ fontSize: 16 }}>
              {formatMessage('There was an unexpected error importing bot content to ')}
              <span css={boldText}>{importPayload.name}</span>
            </p>
            <p css={boldText}>{typeof error === 'object' ? JSON.stringify(error, undefined, 2) : error}</p>
            <DialogFooter>
              <DefaultButton text={formatMessage('Cancel')} onClick={cancel} />
            </DialogFooter>
          </Dialog>
        );

      case 'signingIn':
        // block but don't show anything other than the login window
        return (
          <Dialog
            hidden={false}
            dialogContentProps={{ type: DialogType.normal }}
            styles={{ main: { display: 'none' } }}
          />
        );

      default:
        return <div style={{ display: 'none' }} />;
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
