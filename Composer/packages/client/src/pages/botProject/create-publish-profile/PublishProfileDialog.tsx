// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useEffect, useCallback } from 'react';
import { PublishTarget } from '@bfc/shared';
import formatMessage from 'format-message';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

import { getTokenFromCache, isGetTokenFromUser } from '../../../utils/auth';
import { PublishType } from '../../../recoilModel/types';
import { PluginAPI } from '../../../plugins/api';
import { PluginHost } from '../../../components/PluginHost/PluginHost';
import { defaultPublishSurface, pvaPublishSurface, azurePublishSurface } from '../../publish/styles';
import TelemetryClient from '../../../telemetry/TelemetryClient';

import { EditProfileDialog } from './EditProfileDialog';
import { AddProfileDialog } from './AddProfileDialog';

type PublishProfileDialogProps = {
  closeDialog: () => void;
  current: { index: number; item: PublishTarget } | null;
  targets: PublishTarget[];
  types: PublishType[];
  projectId: string;
  setPublishTargets: (targets: PublishTarget[], projectId: string) => Promise<void>;
};

enum Page {
  AddProfile = 'add',
  EditProfile = 'edit',
  ConfigProvision = 'config',
}

export const PublishProfileDialog: React.FC<PublishProfileDialogProps> = (props) => {
  const { current, types, projectId, closeDialog, targets, setPublishTargets } = props;
  const [page, setPage] = useState(current ? Page.EditProfile : Page.AddProfile);
  const [publishSurfaceStyles, setStyles] = useState(defaultPublishSurface);

  const [dialogTitle, setTitle] = useState({
    title: formatMessage('Add a publish profile'),
    subText: formatMessage(
      'Publish profile informs your bot where to use resources from. The resoruces you provision for your bot will live within this profile'
    ),
  });

  const [selectedType, setSelectType] = useState<PublishType | undefined>();

  useEffect(() => {
    const ty = types.find((t) => t.name === current?.item.type);
    setSelectType(ty);
  }, [types, current]);

  useEffect(() => {
    if (selectedType?.bundleId) {
      // render custom plugin view
      switch (selectedType.extensionId) {
        case 'pva-publish-composer':
          setStyles(pvaPublishSurface);
          break;
        case 'azurePublish':
          setStyles(azurePublishSurface);
          break;
        default:
          setStyles(defaultPublishSurface);
          break;
      }
    }
  }, [selectedType]);

  // setup plugin APIs
  useEffect(() => {
    PluginAPI.publish.closeDialog = closeDialog;
    PluginAPI.publish.onBack = () => {
      setPage(Page.AddProfile);
    };
    PluginAPI.publish.getTokenFromCache = () => {
      return {
        accessToken: getTokenFromCache('accessToken'),
        graphToken: getTokenFromCache('graphToken'),
      };
    };
    PluginAPI.publish.isGetTokenFromUser = () => {
      return isGetTokenFromUser();
    };
    PluginAPI.publish.setTitle = (value) => {
      setTitle(value);
    };
  }, []);

  // setup plugin APIs so that the provisioning plugin can initiate the process from inside the iframe
  useEffect(() => {
    PluginAPI.publish.useConfigBeingEdited = () => [current ? JSON.parse(current.item.configuration) : undefined];
    PluginAPI.publish.currentProjectId = () => {
      return projectId;
    };
  }, [current, projectId]);

  const updatePublishTarget = useCallback(
    async (name: string, type: string, configuration: string, editTarget: any) => {
      if (!editTarget) {
        return;
      }

      const newTargets = targets ? [...targets] : [];
      newTargets[editTarget.index] = {
        name,
        type,
        configuration,
      };

      await setPublishTargets(newTargets, projectId);
    },
    [targets, projectId]
  );

  const savePublishTarget = useCallback(
    async (name: string, type: string, configuration: string) => {
      const newTargets = [...(targets || []), { name, type, configuration }];
      await setPublishTargets(newTargets, projectId);
      TelemetryClient.track('NewPublishingProfileSaved', { type });
    },
    [targets, projectId]
  );

  return (
    <Fragment>
      {page === Page.EditProfile && (
        <EditProfileDialog
          current={props.current}
          types={types}
          updateSettings={updatePublishTarget}
          onDismiss={closeDialog}
        />
      )}
      {page != Page.EditProfile && (
        <DialogWrapper
          isOpen
          dialogType={DialogTypes.Customer}
          minWidth={900}
          subText={dialogTitle.subText}
          title={dialogTitle.title}
          onDismiss={closeDialog}
        >
          {page === Page.AddProfile && (
            <AddProfileDialog
              projectId={projectId}
              setType={setSelectType}
              targets={targets}
              types={types}
              updateSettings={savePublishTarget}
              onDismiss={closeDialog}
              onNext={() => {
                setPage(Page.ConfigProvision);
              }}
            />
          )}
          {page === Page.ConfigProvision && selectedType?.bundleId && (
            <div css={publishSurfaceStyles}>
              <PluginHost bundleId={selectedType.bundleId} pluginName={selectedType.extensionId} pluginType="publish" />
            </div>
          )}
        </DialogWrapper>
      )}
    </Fragment>
  );
};
