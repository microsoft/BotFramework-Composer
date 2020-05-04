// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

export const inlineModePlaceholder = formatMessage(`> add some example phrases to trigger this intent:
> - please tell me the weather
> - what is the weather like in '{city=Seattle}'
>
> entity definitions:
> @ ml city`);

export const LU_HELP = 'https://aka.ms/lu-file-format';
export const defaultPlaceholder = formatMessage(
  `> To learn more about the LU file format, read the documentation at
> {LU_HELP}`,
  { LU_HELP }
);
