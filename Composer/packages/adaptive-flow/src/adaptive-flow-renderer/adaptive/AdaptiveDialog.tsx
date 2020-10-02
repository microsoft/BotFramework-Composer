// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, Fragment } from 'react';
import get from 'lodash/get';
import { FlowEditorWidgetMap, FlowUISchema } from '@bfc/extension-client';

import { EditorEventHandler } from '../constants/NodeEventTypes';
import { RendererContext, DefaultRenderers, RendererContextData } from '../contexts/RendererContext';
import builtinSchema from '../configs/builtinSchema';
import builtinWidgets from '../configs/builtinWidgets';
import { SchemaContext } from '../contexts/SchemaContext';
import { WidgetSchemaProvider } from '../utils/visual/WidgetSchemaProvider';

import { AdaptiveTrigger } from './AdaptiveTrigger';

export interface AdaptiveDialogProps {
  /** Dialog ID */
  dialogId: string;

  /** Dialog JSON */
  dialogData: any;

  /** Current active trigger path such as 'triggers[0]' */
  activeTrigger: string;

  /** Editor event handler */
  onEvent: EditorEventHandler;

  /** UI schema to define how to render a sdk $kind */
  schema: FlowUISchema;

  /** All available widgets to render a node */
  widgets: FlowEditorWidgetMap;
  renderers?: Partial<RendererContextData>;
}

export const AdaptiveDialog: FC<AdaptiveDialogProps> = ({
  dialogId,
  dialogData,
  activeTrigger,
  onEvent,
  schema = builtinSchema,
  widgets = builtinWidgets,
  renderers = {},
}): JSX.Element => {
  const activeTriggerData = get(dialogData, activeTrigger, null);
  if (!activeTriggerData) {
    return <Fragment />;
  }

  return (
    <SchemaContext.Provider
      value={{
        widgets: { ...builtinWidgets, ...widgets },
        schemaProvider: new WidgetSchemaProvider(builtinSchema, schema),
      }}
    >
      <RendererContext.Provider
        value={{
          ...DefaultRenderers,
          ...renderers,
        }}
      >
        <AdaptiveTrigger
          key={`${dialogId}/${activeTrigger}`}
          triggerData={activeTriggerData}
          triggerId={activeTrigger}
          onEvent={onEvent}
        />
      </RendererContext.Provider>
    </SchemaContext.Provider>
  );
};

AdaptiveDialog.defaultProps = {
  dialogId: '',
  dialogData: {},
  onEvent: () => null,
};
