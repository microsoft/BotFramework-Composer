// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { MutableDataStore } from 'src/app/stores/dataStore';
import { SchemaAction } from 'src/app/handlers/schemaHandler';
import { MutableSettingsStore } from 'src/app/stores/settingsStore';
import { SettingsAction } from 'src/app/handlers/settingsHandler';
import { UndoAction } from 'src/app/handlers/undoHandler';

export type HandlerDependencies = {
  dataStore: MutableDataStore;
  settingsStore: MutableSettingsStore;
};

export type Action = SchemaAction & SettingsAction & UndoAction;
