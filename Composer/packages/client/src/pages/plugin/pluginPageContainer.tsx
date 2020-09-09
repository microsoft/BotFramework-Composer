// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { RouteComponentProps } from '@reach/router';

import { PluginHost } from '../../components/PluginHost/PluginHost';

const PluginPageContainer: React.FC<RouteComponentProps<{ pluginId: string }>> = (props) => {
  const { pluginId } = props;

  return <PluginHost pluginName={pluginId} pluginType={'page'}></PluginHost>;
};

export { PluginPageContainer };
