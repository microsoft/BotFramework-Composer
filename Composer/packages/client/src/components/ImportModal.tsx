/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect } from 'react';
import { navigate, RouteComponentProps } from '@reach/router';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';

import { LoadingSpinner } from './LoadingSpinner';

export const ImportModal: React.FC<RouteComponentProps> = (props) => {
  const { location } = props;
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

          const res = await fetch(`/api/import/${source}?payload=${encodeURIComponent(payload)}`, {
            method: 'POST',
          });
          if (res.status !== 200) {
            throw `Something went wrong during import: ${res.status} ${res.statusText}`;
          }
          const data = await res.json();

          // navigate to creation flow with template selected
          const { eTag, templateDir } = data;
          const { description, name } = JSON.parse(payload) as { description: string; name: string };
          navigate(
            `/projects/create/${encodeURIComponent(source)}?imported=true&templateDir=${encodeURIComponent(
              templateDir
            )}&name=${encodeURIComponent(name)}&description=${encodeURIComponent(
              description
            )}&eTag=${encodeURIComponent(eTag)}`
          );
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
