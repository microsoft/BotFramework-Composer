// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { DirectLineLog } from '@bfc/shared';
import { jsx } from '@emotion/core';
import { SharedColors, CommunicationColors } from '@uifabric/fluent-theme';

export interface WebchatLogItemProps {
  item: DirectLineLog;
}

// TODO: #5564 Functional implementation complete. Visual updates required.
export const WebchatLogItem: React.FC<WebchatLogItemProps> = ({ item }) => {
  return (
    <div>
      [<span css={{ color: `${SharedColors.green20}` }}>{item.timestamp}</span>]
      <span css={{ marginLeft: 10, color: `${CommunicationColors.primary}` }}>{item.status}</span>
      <span css={{ marginLeft: 10, color: `${SharedColors.gray20}` }}>{item.route}</span>
      <span css={{ marginLeft: 10, color: `${SharedColors.gray20}` }}>{item.message}</span>
      <span css={{ marginLeft: 10, color: `${SharedColors.gray20}` }}>{item.details}</span>
    </div>
  );
};
