// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { onSnapshot } from 'mobx-state-tree';
import * as React from 'react';
import { VisualEditor } from 'src/app/components/VisualEditor';
import { ContextProvider, ContextValue } from 'src/app/context/Context';
import { getDispatcher } from 'src/app/dispatcher/dispatcher';
import { useHandlers } from 'src/app/dispatcher/hooks/useHandlers';
import { createSchemaHandler } from 'src/app/handlers/schemaHandler';
import { createSettingsHandler } from 'src/app/handlers/settingsHandler';
import { createUndoHandler } from 'src/app/handlers/undoHandler';
import { startup } from 'src/app/startup';
import { createSchemaStoreFromJson } from 'src/app/stores/schemaUtils';
import { useTheme } from 'src/app/theme/useTheme';
import { generateId } from 'src/app/utils/base';

export type VisualSchemaEditorProps = {
  /**
   * Unique id for the visual editor.
   */
  editorId: string;
  /**
   * Wether to show or hide the theme picker.
   */
  showThemePicker?: boolean;
  /**
   * Initial json schema content.
   */
  schema: { id: string; content: string };
  /**
   * Form dialog schema file extension.
   */
  schemaExtension?: string;
  /**
   * Record of available schema templates.
   */
  templates?: string[];
  /**
   * Callback for when the json schema update is updated.
   */
  onSchemaUpdated: (id: string, content: string) => void;
};

/**
 * Imperative call to get the id of the editor.
 */
export type VisualSchemaEditorRef = {
  getEditorId: () => string;
};

export const VisualSchemaEditor = React.memo(
  React.forwardRef((props: VisualSchemaEditorProps, ref: React.Ref<VisualSchemaEditorRef>) => {
    const {
      editorId,
      onSchemaUpdated,
      schema,
      showThemePicker = false,
      templates = [],
      schemaExtension = '.schema',
    } = props;
    const getSchema = () => props.schema;

    const uniqueId = React.useRef(editorId || generateId());
    const { 0: appProps, 1: setAppProps } = React.useState<ContextValue>();

    React.useImperativeHandle(
      ref,
      (): VisualSchemaEditorRef => ({
        getEditorId: () => uniqueId.current,
      })
    );

    React.useEffect(() => {
      const { dataStore, settingsStore } = startup(editorId, { snapshot: false });
      const dispatcher = getDispatcher(dataStore, settingsStore);
      const propsSchema = getSchema();

      if (propsSchema) {
        dataStore.setSchema(createSchemaStoreFromJson(propsSchema.id, propsSchema.content));
      }

      onSnapshot(dataStore, (snapshot) => onSchemaUpdated(snapshot.schema.name, dataStore.schema.toJson));

      setAppProps({ dataStore, settingsStore, dispatcher, templates });
    }, [editorId]);

    useTheme(appProps?.settingsStore);
    useHandlers(appProps?.dispatcher, createSchemaHandler, createSettingsHandler, createUndoHandler);

    const startOver = () => {
      appProps.dispatcher.dispatch('reset', { name: schema.id });
    };

    return appProps ? (
      <ContextProvider {...appProps}>
        <VisualEditor schemaExtension={schemaExtension} showThemePicker={showThemePicker} onReset={startOver} />
      </ContextProvider>
    ) : null;
  })
);
