// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { WebchatLog } from '@bfc/shared';
import { jsx } from '@emotion/core';

export interface WebchatLogItemProps {
  item: WebchatLog;
}

export const WebchatLogItem: React.FC<WebchatLogItemProps> = ({ item }) => {
  return <div css={{}}>{JSON.stringify(item)}</div>;
};
