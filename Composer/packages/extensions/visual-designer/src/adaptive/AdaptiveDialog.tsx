// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useContext } from 'react';
import get from 'lodash/get';
import { MicrosoftAdaptiveDialog } from '@bfc/shared';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { EditorContext } from '../store/EditorContext';
import { Collapse } from '../components/lib/Collapse';
import { ObiFieldNames } from '../constants/ObiFieldNames';

import { AdaptiveEventList } from './list/AdaptiveEventList';
import { AdaptiveEvent } from './AdaptiveEvent';

export interface AdaptiveDialogProps {
  path: string;
  data: MicrosoftAdaptiveDialog;
  onEvent: (eventName: NodeEventTypes, eventData?: any) => any;
}

export const AdaptiveDialog: FC<AdaptiveDialogProps> = ({ data, onEvent }): JSX.Element => {
  const eventsPath = ObiFieldNames.Events;
  const events = get(data, eventsPath, []);

  const FocusedEvent = () => {
    const { focusedEvent } = useContext(EditorContext);
    const focusedEventData = focusedEvent ? get(data, focusedEvent) : null;
    if (!focusedEventData) return null;
    return <AdaptiveEvent path={focusedEvent || ''} data={focusedEventData} onEvent={onEvent} />;
  };

  return (
    <div
      css={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, { id: '' });
      }}
    >
      <AdaptiveEventList path={eventsPath} events={events} onEvent={onEvent} />
      <div className="editor-interval" style={{ height: 50 }} />
      <Collapse text="Actions">
        <FocusedEvent />
      </Collapse>
    </div>
  );
};
