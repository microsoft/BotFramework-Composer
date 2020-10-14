// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension-client';
import { FixedInfo, SingleLineDiv } from '@bfc/ui-shared';

export interface ResourceOperationProps extends WidgetContainerProps {
  operation: string;
  resource: string;
  singleline?: boolean;
}

export const ResourceOperation: WidgetComponent<ResourceOperationProps> = ({
  operation,
  resource,
  singleline = false,
}) => {
  if (singleline) {
    return (
      <SingleLineDiv>
        <FixedInfo>{operation}</FixedInfo> {resource}
      </SingleLineDiv>
    );
  }
  return (
    <>
      <FixedInfo>{operation}</FixedInfo> {resource}
    </>
  );
};
