// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RoleSchema } from '@bfc/extension';
import { SDKRoles } from '@bfc/shared';

import { StringField } from './components/fields';

const DefaultRoleSchema: RoleSchema = {
  [SDKRoles.expression]: {
    field: StringField,
  },
};

export default DefaultRoleSchema;
