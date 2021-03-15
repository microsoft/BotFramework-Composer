// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useEffect, useCallback } from 'react';
import { PublishTarget } from '@bfc/shared';
import formatMessage from 'format-message';
import { Dialog } from 'office-ui-fabric-react/lib/Dialog';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { useRecoilValue } from 'recoil';

import { getTokenFromCache, isGetTokenFromUser, setTenantId, getTenantIdFromCache } from '../../../utils/auth';
import { PublishType } from '../../../recoilModel/types';
import { PluginAPI } from '../../../plugins/api';
import { PluginHost } from '../../../components/PluginHost/PluginHost';
import { defaultPublishSurface, pvaPublishSurface, azurePublishSurface } from '../../publish/styles';
import TelemetryClient from '../../../telemetry/TelemetryClient';
import { AuthClient } from '../../../utils/authClient';
import { graphScopes } from '../../../constants';
import { dispatcherState } from '../../../recoilModel';

import { ProfileFormDialog } from './ProfileFormDialog';

type PublishProfileDialogProps = {
  closeDialog: () => void;
  current: { index: number; item: PublishTarget } | null;
  targets: PublishTarget[];
  types: PublishType[];
  projectId: string;
  setPublishTargets: (targets: PublishTarget[], projectId: string) => Promise<void>;
};

const Page = {
  ProfileForm: Symbol('form'),
  ConfigProvision: Symbol('config'),
};

export const PublishProfileDialog: React.FC<PublishProfileDialogProps> = (props) => {
  const { current, types, projectId, closeDialog, targets, setPublishTargets } = props;
  const [name, setName] = useState(current?.item.name || '');
  const [targetType, setTargetType] = useState<string>(current?.item.type || '');

  const [page, setPage] = useState(Page.ProfileForm);
  const [publishSurfaceStyles, setStyles] = useState(defaultPublishSurface);
  const { provisionToTarget } = useRecoilValue(dispatcherState);

  const [dialogTitle, setTitle] = useState({
    title: current ? formatMessage('Edit a publishing profile') : formatMessage('Add a publishing profile'),
    subText: formatMessage('A publishing profile provides the secure connectivity required to publish your bot. '),
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
      setPage(Page.ProfileForm);
      setTitle({
        title: current ? formatMessage('Edit a publishing profile') : formatMessage('Add a publishing profile'),
        subText: formatMessage('A publishing profile provides the secure connectivity required to publish your bot. '),
      });
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
    PluginAPI.publish.getTenantIdFromCache = () => {
      return getTenantIdFromCache();
    };
    PluginAPI.publish.setTenantId = (value) => {
      setTenantId(value);
    };
  }, []);

  // setup plugin APIs so that the provisioning plugin can initiate the process from inside the iframe
  useEffect(() => {
    PluginAPI.publish.getPublishConfig = () => (current ? JSON.parse(current.item.configuration) : undefined);
    PluginAPI.publish.currentProjectId = () => {
      return projectId;
    };
    if (current?.item.type) {
      setPage(Page.ConfigProvision);
    } else {
      setPage(Page.ProfileForm);
    }
  }, [current, projectId]);

  const savePublishTarget = useCallback(
    async (name: string, type: string, configuration: string) => {
      // check exist
      const newTargets = [...targets] || [];
      const index = targets.findIndex((item) => item.name === name);
      if (index >= 0) {
        newTargets.splice(index, 1, { name, type, configuration });
      } else {
        newTargets.push({ name, type, configuration });
      }
      await setPublishTargets(newTargets, projectId);
      try {
        const parsedConfiguration = JSON.parse(configuration);
        TelemetryClient.track('NewPublishingProfileSaved', {
          type,
          msAppId: parsedConfiguration.settings?.MicrosoftAppId,
          subscriptionId: parsedConfiguration.subscriptionId,
        });
      } catch {
        TelemetryClient.track('NewPublishingProfileSaved', { type });
      }
    },
    [targets, projectId]
  );

  useEffect(() => {
    PluginAPI.publish.getType = () => {
      return targetType;
    };
    PluginAPI.publish.getName = () => {
      return name;
    };
    PluginAPI.publish.getSchema = () => {
      return types.find((t) => t.name === targetType)?.schema;
    };
    PluginAPI.publish.savePublishConfig = (config) => {
      savePublishTarget(name, targetType, JSON.stringify(config) || '{}');
    };
    PluginAPI.publish.startProvision = async (config) => {
      const fullConfig = { ...config, name: name, type: targetType };
      let arm, graph;
      if (!isGetTokenFromUser()) {
        // login or get token implicit
        let tenantId = getTenantIdFromCache();
        if (!tenantId) {
          const tenants = await AuthClient.getTenants();
          tenantId = tenants?.[0]?.tenantId;
          setTenantId(tenantId);
        }
        arm = await AuthClient.getARMTokenForTenant(tenantId);
        graph = await AuthClient.getAccessToken(graphScopes);
      } else {
        // get token from cache
        arm = getTokenFromCache('accessToken');
        graph = getTokenFromCache('graphToken');
      }
      provisionToTarget(fullConfig, config.type, projectId, arm, graph, current?.item);
    };
  }, [name, targetType, types, savePublishTarget]);

  return (
    <Fragment>
      <Dialog
        dialogContentProps={{
          title: dialogTitle.title,
          subText: '',
        }}
        hidden={false}
        minWidth={960}
        modalProps={{
          isBlocking: true,
        }}
        onDismiss={closeDialog}
      >
        {page !== Page.ConfigProvision && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              {dialogTitle.subText}
              <Link href="https://aka.ms/bf-composer-docs-publish-bot" target="_blank">
                {formatMessage('Learn More.')}
              </Link>
            </div>
            <ProfileFormDialog
              current={current}
              name={name}
              setName={setName}
              setTargetType={setTargetType}
              setType={setSelectType}
              targets={targets}
              targetType={targetType}
              types={types}
              onDismiss={closeDialog}
              onNext={() => {
                setPage(Page.ConfigProvision);
              }}
            />
          </div>
        )}
        {page === Page.ConfigProvision && selectedType?.bundleId && (
          <Fragment>
            <div style={{ marginBottom: '16px' }}>{dialogTitle.subText}</div>
            <div css={publishSurfaceStyles}>
              <PluginHost bundleId={selectedType.bundleId} pluginName={selectedType.extensionId} pluginType="publish" />
            </div>
          </Fragment>
        )}
      </Dialog>
    </Fragment>
  );
};
