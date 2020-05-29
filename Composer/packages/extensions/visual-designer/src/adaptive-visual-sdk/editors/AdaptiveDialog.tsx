// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import get from 'lodash/get';
import { FlowSchema as VisualSDKSchema, FlowEditorWidgetMap as NodeWidgetMap } from '@bfc/extension';

import { EditorEventHandler } from '../constants/NodeEventTypes';
import { RendererContext, DefaultRenderers, RendererContextData } from '../contexts/RendererContext';
import builtinSchema from '../configs/builtinSchema';
import builtinWidgets from '../configs/builtinWidgets';
import { SchemaContext } from '../contexts/SchemaContext';
import { WidgetSchemaProvider } from '../utils/visual/WidgetSchemaProvider';

import { RuleEditor } from './RuleEditor';

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
  schema: VisualSDKSchema;

  /** All available widgets to render a node */
  widgets: NodeWidgetMap;
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
  const content = activeTriggerData ? (
    <RuleEditor key={`${dialogId}/${activeTrigger}`} data={activeTriggerData} id={activeTrigger} onEvent={onEvent} />
  ) : null;

  return (
    <SchemaContext.Provider
      value={{
        widgets: { ...widgets, ...builtinWidgets },
        schemaProvider: new WidgetSchemaProvider(schema, builtinSchema),
      }}
    >
      <RendererContext.Provider
        value={{
          ...DefaultRenderers,
          ...renderers,
        }}
      >
        {content}
      </RendererContext.Provider>
    </SchemaContext.Provider>
  );
};

AdaptiveDialog.defaultProps = {
  dialogId: '',
  dialogData: {},
  onEvent: () => null,
};
