// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { RouteComponentProps } from '@reach/router';

import { PluginHost } from '../../components/PluginHost/PluginHost';
import { useShell } from '../../shell';

const PluginPageContainer: React.FC<RouteComponentProps<{ pluginId: string; bundleId: string; projectId: string }>> = (
  props
) => {
  const { pluginId, bundleId, projectId } = props;
  const shell = useShell('DesignPage', projectId as string);

  if (!pluginId || !bundleId || !projectId) {
    return null;
  }

  return <PluginHost bundleId={bundleId} pluginName={pluginId} pluginType="page" shell={shell} />;
};

export { PluginPageContainer };
