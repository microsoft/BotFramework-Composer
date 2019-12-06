// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';

import { EditorContext } from '../store/EditorContext';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { AdaptiveEvent } from '../adaptive/AdaptiveEvent';

export interface AdaptiveEventEditorProps {
  dialogId: string;
  eventPath: string;
  eventData: any;
  focusedId: string;
  focusedTab: string;
  selectedIds: string[];
  generateTabIndex?: (nodeId: string) => number;
  onEvent: (eventName: NodeEventTypes, eventData?: any) => any;
}

const mapPropsToEditorContext = (props: AdaptiveEventEditorProps) => {
  const { focusedId: focusedAction, focusedTab, selectedIds } = props;
  return {
    focusedId: focusedAction,
    focusedTab,
    selectedIds,
  };
};

export const AdaptiveEventEditor: FC<AdaptiveEventEditorProps> = (props): JSX.Element => {
  const { dialogId, eventPath, eventData } = props;
  const onEvent = props.onEvent || (() => null);

  return (
    <EditorContext.Provider
      value={{
        ...mapPropsToEditorContext(props),
        getNodeIndex: props.generateTabIndex || (() => 0),
      }}
    >
      <AdaptiveEvent key={`${dialogId}/${eventPath}`} path={eventPath} data={eventData} onEvent={onEvent} />
    </EditorContext.Provider>
  );
};

AdaptiveEventEditor.defaultProps = {
  onEvent: () => null,
};
