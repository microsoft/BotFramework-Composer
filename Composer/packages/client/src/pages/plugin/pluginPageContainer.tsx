// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { RouteComponentProps } from '@reach/router';

import { PluginHost } from '../../components/PluginHost/PluginHost';

const PluginPageContainer: React.FC<RouteComponentProps<{ pluginId: string; bundleId: string }>> = (props) => {
  const { pluginId, bundleId } = props;

  if (!pluginId || !bundleId) {
    return null;
  }

  return <PluginHost bundleId={bundleId} pluginName={pluginId} pluginType="page"></PluginHost>;
};

export { PluginPageContainer };
