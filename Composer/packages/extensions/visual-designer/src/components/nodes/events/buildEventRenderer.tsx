// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import React, { FC } from 'react';

import { NodeProps } from '../types/nodeProps';
import { RuleCard } from '../templates/RuleCard';

export default function buildEventRenderer(resolveEventTitle: (eventData: any) => string): FC<NodeProps> {
  return ({ id, data, focused, onEvent, renderers: { NodeMenu } }) => (
    <RuleCard
      id={id}
      data={data}
      focused={focused}
      label={resolveEventTitle(data)}
      corner={<NodeMenu nodeId={id} onEvent={onEvent} />}
      onEvent={onEvent}
    />
  );
}
