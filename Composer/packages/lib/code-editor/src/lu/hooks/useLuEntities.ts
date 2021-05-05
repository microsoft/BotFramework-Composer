// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuEntity, LuFile } from '@botframework-composer/types';
import * as React from 'react';
import uniqBy from 'lodash/uniqBy';

import { ToolbarLuEntityType, toolbarSupportedLuEntityTypes } from '../types';

export const useLuEntities = (luFile?: LuFile, filterPredicate?: (e: LuEntity) => boolean) => {
  const [entities, setEntities] = React.useState<LuEntity[]>([]);

  React.useEffect(() => {
    if (luFile) {
      const luEntities = luFile.intents.reduce((acc, e) => {
        let items = (e.Entities ?? ([] as LuEntity[])).filter((e) =>
          toolbarSupportedLuEntityTypes.includes(e.Type as ToolbarLuEntityType)
        );

        if (filterPredicate) {
          items = items.filter(filterPredicate);
        }

        acc.push(...items);

        return acc;
      }, [] as LuEntity[]);

      if (luEntities.length) {
        setEntities(uniqBy(luEntities, 'Name').sort((a, b) => (a.Name > b.Name ? 1 : -1)));
        return;
      }

      setEntities([]);
    } else {
      setEntities([]);
    }
  }, [luFile, filterPredicate]);

  return entities;
};
