// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo, useState } from 'react';

import { StoreContext } from '../../store';

import { INotification } from './types';

const test = [
  {
    type: 'Error',
    location: 'RootDialog',
    message:
      "/* Error message: Parse failed for expression 'lkajsd()', inner error: Error: lkajsd does not have an evaluator, it's not a built-in function or a customized function in template refer… */",
  },
  {
    type: 'Warning',
    location: 'common.lg',
    message:
      "Error message: Parse failed for expression 'glhas == add()', inner error: Error: +() should have at least 2 children. in expression 'glhas == add()'",
  },
  {
    type: 'Error',
    location: 'Common.lu',
    message:
      "Error message: Parse failed for expression 'lkajsd()', inner error: Error: lkajsd does not have an evaluator, it's not a built-in function or a customized function in template refer… ",
  },
  {
    type: 'Warning',
    location: 'AddToDo',
    message:
      "Error message: Parse failed for expression 'glhas == add()', inner error: Error: +() should have at least 2 children. in expression 'glhas == add()'",
  },
];

const testLocation = ['RootDialog', 'common.lg', 'Common.lu', 'AddToDo'];
export default function useNotifications() {
  const { state } = useContext(StoreContext);
  const [filter, setFilter] = useState('');
  const { dialogs, luFiles, lgFiles } = state;

  const memorized = useMemo(() => {
    const notifactions: INotification[] = [];
    const locations = new Set();
    dialogs.forEach(dialog => {
      locations.add(dialog.id);
      dialog.diagnostics.map(diagnostic => {
        notifactions.push({
          type: 'Error',
          location: dialog.id,
          message: diagnostic,
        });
      });
    });
    luFiles.forEach(lufile => {
      locations.add(lufile.id);
      lufile.diagnostics.map(diagnostic => {
        notifactions.push({
          type: 'Error',
          location: lufile.id,
          message: diagnostic.text,
        });
      });
    });
    lgFiles.forEach(lgFiles => {
      locations.add(lgFiles.id);
      lgFiles.diagnostics.map(diagnostic => {
        notifactions.push({
          type: 'Error',
          location: lgFiles.id,
          message: diagnostic.Message,
        });
      });
    });
    return { notifactions, locations: locations.keys() };
  }, [dialogs, luFiles, lgFiles]);

  const notifications: INotification[] = memorized.notifactions.filter(x => filter === '' || x.location === filter);
  return { notifications: test, setFilter, locations: testLocation };
}
