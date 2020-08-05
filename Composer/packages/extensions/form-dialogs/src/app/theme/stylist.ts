// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { stylistFactory } from 'stylist-react';
import { lightThemeConfig } from 'src/app/theme/lightThemeConfig';
import { buildTheme } from 'src/app/theme/buildTheme';

const styleFactory = stylistFactory('V2', lightThemeConfig, buildTheme);

export const { getStylist, getStylistV2, setTheme, getScopedTheme } = styleFactory;
