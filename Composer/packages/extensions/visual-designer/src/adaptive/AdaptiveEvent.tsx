// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useRef, FC } from 'react';
import isEqual from 'lodash/isEqual';
import { BaseSchema } from '@bfc/shared';

import { Trigger } from '../components/nodes/Trigger';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { outlineObiJson } from '../utils/outlineObiJson';
import { ObiFieldNames } from '../constants/ObiFieldNames';

import { AdaptiveActionList } from './AdaptiveActionList';

export interface AdaptiveEventProps {
  path: string;
  event: BaseSchema;
  onEvent: (eventName: NodeEventTypes, eventData?: any) => any;
}

export const AdaptiveEvent: FC<AdaptiveEventProps> = ({ path, event, onEvent }): JSX.Element => {
  const outlineCache = useRef();
  const outlineVersion = useRef(0);

  useMemo(() => {
    const newOutline = outlineObiJson(event);
    if (!isEqual(newOutline, outlineCache.current)) {
      outlineCache.current = newOutline;
      outlineVersion.current += 1;
    }
  }, [path, event]);

  const actionList = event[ObiFieldNames.Actions] || [];
  const actionListPath = `${path}.${ObiFieldNames.Actions}`;

  return (
    <div
      className="rule-editor"
      data-testid="RuleEditor"
      css={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, { id: '' });
      }}
    >
      <AdaptiveActionList
        key={actionListPath + '?version=' + outlineVersion.current}
        path={actionListPath}
        actions={actionList}
        onEvent={onEvent}
        header={<Trigger data={event} />}
      />
    </div>
  );
};
