// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { onSnapshot } from 'mobx-state-tree';
import * as React from 'react';
import { VisualEditor } from 'src/app/components/VisualEditor';
import { ContextProvider } from 'src/app/context/Context';
import { Dispatcher, getDispatcher } from 'src/app/dispatcher/dispatcher';
import { useHandlers } from 'src/app/dispatcher/hooks/useHandlers';
import { createSchemaHandler } from 'src/app/handlers/schemaHandler';
import { createSettingsHandler } from 'src/app/handlers/settingsHandler';
import { createUndoHandler } from 'src/app/handlers/undoHandler';
import { startup } from 'src/app/startup';
import { DataStore } from 'src/app/stores/dataStore';
import { SettingsStore } from 'src/app/stores/settingsStore';
import { useTheme } from 'src/app/theme/useTheme';
import { generateId } from 'src/app/utils/base';
import { createSchemaStoreFromJson } from 'src/app/stores/schemaUtils';

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

export const VisualSchemaEditor = React.forwardRef(
  (props: VisualSchemaEditorProps, ref: React.Ref<VisualSchemaEditorRef>) => {
    const { editorId, onSchemaUpdated, schema, showThemePicker = false } = props;
    const getSchema = () => props.schema;

    const uniqueId = React.useRef(editorId || generateId());
    const { 0: appProps, 1: setAppProps } = React.useState<{
      dataStore: DataStore;
      settingsStore: SettingsStore;
      dispatcher: Dispatcher;
    }>();

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

      setAppProps({ dataStore, settingsStore, dispatcher });
    }, [editorId]);

    useTheme(appProps?.settingsStore);
    useHandlers(appProps?.dispatcher, createSchemaHandler, createSettingsHandler, createUndoHandler);

    const startOver = () => {
      appProps.dispatcher.dispatch('reset', { name: schema.id });
    };

    return appProps ? (
      <ContextProvider {...appProps}>
        <VisualEditor showThemePicker={showThemePicker} onReset={startOver} />
      </ContextProvider>
    ) : null;
  }
);
