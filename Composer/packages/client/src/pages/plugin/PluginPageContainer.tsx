// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { RouteComponentProps } from '@reach/router';

import { PluginHost } from '../../components/PluginHost/PluginHost';

const PluginPageContainer: React.FC<RouteComponentProps<{ pluginId: string; bundleId: string; projectId: string }>> = (
  props
) => {
  const { pluginId, bundleId, projectId } = props;

  if (!pluginId || !bundleId || !projectId) {
    return null;
  }

  return <PluginHost bundleId={bundleId} pluginName={pluginId} pluginType="page" projectId={projectId} />;
};

export { PluginPageContainer };
