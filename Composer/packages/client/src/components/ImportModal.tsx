/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect } from 'react';
import { navigate, RouteComponentProps } from '@reach/router';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';

import { LoadingSpinner } from './LoadingSpinner';

type NewProjectParams = {
  description?: string;
  eTag: string;
  name?: string;
  source: string;
  templateDir: string;
  urlSuffix?: string;
};

export const ImportModal: React.FC<RouteComponentProps> = (props) => {
  const { location } = props;

  const importAsNewProject = (params: NewProjectParams) => {
    // navigate to creation flow with template selected
    const { description, eTag, name, source, templateDir, urlSuffix } = params;
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

    navigate(creationUrl);
  };

  const importToExistingProject = (params) => {};

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

          if (alias) {
            // check to see if Composer currently has a bot project corresponding to the alias
            res = await fetch(`/api/projects/alias/:alias${alias}`, { method: 'GET' });
            if (res.status === 200) {
              const project = await res.json();
              console.log(`Found project with alias ${alias}: `, project);
              // prompt user to download new content here, if not do creation flow below:
              importToExistingProject({});
            }
          } else {
            importAsNewProject({ description, name, templateDir, urlSuffix, eTag, source });
          }

          // navigate to creation flow with template selected
          // let creationUrl = `/projects/create/${encodeURIComponent(
          //   source
          // )}?imported=true&templateDir=${encodeURIComponent(templateDir)}&eTag=${encodeURIComponent(eTag)}`;

          // if (name) {
          //   creationUrl += `&name=${encodeURIComponent(name)}`;
          // }
          // if (description) {
          //   creationUrl += `&description=${encodeURIComponent(description)}`;
          // }
          // if (urlSuffix) {
          //   creationUrl += `&urlSuffix=${encodeURIComponent(urlSuffix)}`;
          // }

          // navigate(creationUrl);
        } catch (e) {
          // something went wrong, abort and navigate to the home page
          console.error(`Aborting import: ${e}`);
          navigate('/home');
        }
      }
    };
    doImport();
  }, [location]);

  return (
    <Dialog hidden={false} dialogContentProps={{ type: DialogType.normal }}>
      <LoadingSpinner message={formatMessage('Importing bot content...')} />
    </Dialog>
  );
};
