// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { Stack } from '@fluentui/react/lib/Stack';

export const FormStack = styled(Stack)`
  --min-column-size: 337px; /* set so two fields fit on 125% zoom */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--min-column-size), 1fr));
  margin-bottom: 1rem;
  gap: 2rem;
  @media screen and (max-width: 480px) /* 300% zoom */ {
    --min-column-size: 240px;
  }
`;
