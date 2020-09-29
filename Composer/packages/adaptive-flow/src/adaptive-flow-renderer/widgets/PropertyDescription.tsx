// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension-client';
import { FixedInfo } from '@bfc/ui-shared';

export interface PropertyDescriptionProps extends WidgetContainerProps {
  property: any;
  description: string;
  propertyPlaceholder?: string;
  descriptionPlaceholder?: string;
}

export const PropertyDescription: WidgetComponent<PropertyDescriptionProps> = ({
  property,
  description,
  propertyPlaceholder = '?',
  descriptionPlaceholder = '?',
}) => {
  return (
    <>
      {property || propertyPlaceholder} <FixedInfo>{description || descriptionPlaceholder}</FixedInfo>
    </>
  );
};
