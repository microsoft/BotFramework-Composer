/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { navigate, RouteComponentProps } from '@reach/router';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { LoadingSpinner } from './LoadingSpinner';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

type ImportedProjectInfo = {
  alias?: string;
  description?: string;
  eTag: string;
  name?: string;
  source: string;
  templateDir: string;
  urlSuffix?: string;
};

type ExistingProjectInfo = {
  id: string;
  location: string;
};

type ImportModalState = 'importing' | 'prompting' | 'saveToExistingComplete' | 'failed';

const boldText = css`
  font-weight: ${FontWeights.semibold};
  word-break: break-work;
`;

export const ImportModal: React.FC<RouteComponentProps> = (props) => {
  const { location } = props;
  const [importedProjectInfo, setImportedProjectInfo] = useState<ImportedProjectInfo | undefined>(undefined);
  const [modalState, setModalState] = useState<ImportModalState>('importing');
  const [existingProject, setExistingProject] = useState<ExistingProjectInfo | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);
  const [backupLocation, setBackupLocation] = useState<string>('');

  const importAsNewProject = useCallback((info: ImportedProjectInfo) => {
    // navigate to creation flow with template selected
    const { alias, description, eTag, name, source, templateDir, urlSuffix } = info;
    let creationUrl = `/projects/create/${encodeURIComponent(source)}?imported=true&templateDir=${encodeURIComponent(
      templateDir
    )}&eTag=${encodeURIComponent(eTag)}`;

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
      setModalState('importing');

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

          // show complete modal
          if (res.status === 200) {
            setModalState('saveToExistingComplete');
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
    const doImport = async () => {
      if (location && location.href) {
        try {
          const url = new URL(location.href);
          const source = url.searchParams.get('source');
          const payload = url.searchParams.get('payload');
          if (!source || !payload) {
            throw 'Missing source or payload.';
          }
          const { description, name } = JSON.parse(payload) as { description: string; name: string };

          let res = await fetch(`/api/import/${source}?payload=${encodeURIComponent(payload)}`, {
            method: 'POST',
          });
          if (res.status !== 200) {
            throw `Something went wrong during import: ${res.status} ${res.statusText}`;
          }
          const data = await res.json();
          const { alias, eTag, templateDir, urlSuffix } = data;
          const projectInfo = { description, name, templateDir, urlSuffix, eTag, source, alias };
          setImportedProjectInfo(projectInfo);

          if (alias) {
            // check to see if Composer currently has a bot project corresponding to the alias
            res = await fetch(`/api/projects/alias/${alias}`, { method: 'GET' });
            if (res.status === 200) {
              const project = await res.json();
              setExistingProject(project);
              // ask user if they want to save to existing, or save as a new project
              setModalState('prompting');
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
    doImport();
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
      case 'importing':
        return (
          <Dialog hidden={false} dialogContentProps={{ type: DialogType.normal }}>
            <LoadingSpinner message={formatMessage('Importing bot content...')} />
          </Dialog>
        );

      case 'prompting':
        return (
          <Dialog
            hidden={false}
            dialogContentProps={{ title: formatMessage('Existing project found'), type: DialogType.normal }}
            minWidth={480}
          >
            <p>
              {formatMessage(
                'We found an existing bot project that matches the bot you are importing. Would you like to save to the existing project or create a new project?'
              )}
            </p>
            <p css={boldText}>{existingProject?.location}</p>
            <DialogFooter>
              <DefaultButton text={formatMessage('Cancel')} onClick={cancel} />
              <PrimaryButton text={formatMessage('Save to existing')} onClick={importToExistingProject} />
              <PrimaryButton text={formatMessage('Save as new')} onClick={createNewProxy} />
            </DialogFooter>
          </Dialog>
        );

      case 'saveToExistingComplete':
        return (
          <Dialog
            hidden={false}
            dialogContentProps={{ title: formatMessage('Save successful'), type: DialogType.normal }}
            minWidth={480}
          >
            <p>{formatMessage('New bot content successfully imported to bot project at:')}</p>
            <p css={boldText}>{existingProject?.location}</p>
            <p>{formatMessage('Your old bot content was backed up to:')}</p>
            <p css={boldText}>{backupLocation}</p>
            <DialogFooter>
              <PrimaryButton text={formatMessage('Continue')} onClick={openExistingProject} />
            </DialogFooter>
          </Dialog>
        );

      case 'failed':
        return (
          <Dialog
            hidden={false}
            dialogContentProps={{
              title: formatMessage('Importing to existing project failed'),
              type: DialogType.normal,
            }}
            minWidth={480}
          >
            <p>{formatMessage('There was an error while trying to import bot content to an existing project:')}</p>
            <p css={boldText}>{typeof error === 'object' ? JSON.stringify(error, undefined, 2) : error}</p>
            <DialogFooter>
              <PrimaryButton text={formatMessage('Dismiss')} onClick={cancel} />
            </DialogFooter>
          </Dialog>
        );

      default:
        return <div style={{ display: 'none' }} />;
    }
  }, [modalState, existingProject, error, openExistingProject, backupLocation, importedProjectInfo]);

  return modalContent;
};
