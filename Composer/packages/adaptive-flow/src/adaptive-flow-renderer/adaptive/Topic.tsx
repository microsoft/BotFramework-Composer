// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { FlowEditorWidgetMap, FlowUISchema, SchemaDefinitions } from '@bfc/extension-client';

import { EditorEventHandler } from '../constants/NodeEventTypes';
import { RendererContext, DefaultRenderers, RendererContextData } from '../contexts/RendererContext';
import builtinSchema from '../configs/builtinSchema';
import builtinWidgets from '../configs/builtinWidgets';
import { SchemaContext } from '../contexts/SchemaContext';
import { WidgetSchemaProvider } from '../utils/visual/WidgetSchemaProvider';

import { AdaptiveTrigger } from './AdaptiveTrigger';

export interface TopicProps {
  /** Dialog ID */
  dialogId: string;

  /** Dialog JSON */
  dialogData: any;

  /** Editor event handler */
  onEvent: EditorEventHandler;

  /** UI schema to define how to render a sdk $kind */
  uischema: FlowUISchema;

  /** All available widgets to render a node */
  widgets: FlowEditorWidgetMap;

  /** SDK schema to define the data model of a sdk $kind */
  sdkschema?: SchemaDefinitions;

  renderers?: Partial<RendererContextData>;
}

export const Topic: FC<TopicProps> = ({
  dialogId,
  dialogData,
  onEvent,
  sdkschema,
  uischema = builtinSchema,
  widgets = builtinWidgets,
  renderers = {},
}): JSX.Element => {
  return (
    <SchemaContext.Provider
      value={{
        widgets: { ...builtinWidgets, ...widgets },
        schemaProvider: new WidgetSchemaProvider(builtinSchema, uischema),
        sdkschema,
      }}
    >
      <RendererContext.Provider
        value={{
          ...DefaultRenderers,
          ...renderers,
        }}
      >
        <AdaptiveTrigger key={dialogId} triggerData={dialogData} triggerId={'test'} onEvent={onEvent} />
      </RendererContext.Provider>
    </SchemaContext.Provider>
  );
};

Topic.defaultProps = {
  dialogId: '',
  dialogData: {},
  onEvent: () => null,
};
