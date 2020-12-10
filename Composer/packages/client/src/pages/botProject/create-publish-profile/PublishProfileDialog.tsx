// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useMemo, useEffect, useCallback } from 'react';
import { PublishTarget } from '@bfc/shared';
import { getTokenFromCache, isGetTokenFromUser } from '../../../utils/auth';
import { PublishType } from '../../../recoilModel/types';
import formatMessage from 'format-message';
import { PluginAPI } from '../../../plugins/api';
import { PluginHost } from '../../../components/PluginHost/PluginHost';
import { defaultPublishSurface, pvaPublishSurface, azurePublishSurface } from '../../publish/styles';
import { EditProfileDialog } from './EditProfileDialog';
import { AddProfileDialog } from './AddProfileDialog';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

type PublishProfileDialogProps = {
  closeDialog: () => void;
  current: { index: number; item: PublishTarget } | null;
  targets: PublishTarget[];
  types: PublishType[];
  projectId: string;
  setPublishTargets: (targets: PublishTarget[], projectId: string) => Promise<void>;
};

enum PageTypes {
  AddProfile = 'add',
  EditProfile = 'edit',
  ConfigProvision = 'config',
}

export const PublishProfileDialog: React.FC<PublishProfileDialogProps> = (props) => {
  const { current, types, projectId, closeDialog, targets, setPublishTargets } = props;
  // const [config, setConfig] = useState(current ? JSON.parse(current.item.configuration) : undefined);
  // const [pluginConfigIsValid, setPluginConfigIsValid] = useState(false);
  const [page, setPage] = useState(current ? PageTypes.EditProfile : PageTypes.AddProfile);
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
    PluginAPI.publish.setPublishConfig = (config) => console.log(config); //setConfig(config);
    PluginAPI.publish.setConfigIsValid = (valid) => console.log(valid); //setPluginConfigIsValid(valid);
    PluginAPI.publish.closeDialog = closeDialog;
    PluginAPI.publish.onBack = () => {
      setPage(PageTypes.AddProfile);
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
    },
    [targets, projectId]
  );

  return (
    <Fragment>
      {page === PageTypes.EditProfile && (
        <EditProfileDialog
          onDismiss={closeDialog}
          current={props.current}
          types={types}
          updateSettings={updatePublishTarget}
        />
      )}
      {page != PageTypes.EditProfile && (
        <DialogWrapper
          dialogType={DialogTypes.Customer}
          isOpen={true}
          minWidth={900}
          title={dialogTitle.title}
          subText={dialogTitle.subText}
          onDismiss={closeDialog}
        >
          {page === PageTypes.AddProfile && (
            <AddProfileDialog
              onDismiss={closeDialog}
              onNext={() => {
                setPage(PageTypes.ConfigProvision);
              }}
              targets={targets}
              types={types}
              updateSettings={savePublishTarget}
              projectId={projectId}
              setType={setSelectType}
            />
          )}
          {page === PageTypes.ConfigProvision && selectedType?.bundleId && (
            <div css={publishSurfaceStyles}>
              <PluginHost bundleId={selectedType.bundleId} pluginName={selectedType.extensionId} pluginType="publish" />
            </div>
          )}
        </DialogWrapper>
      )}
    </Fragment>
  );
};
