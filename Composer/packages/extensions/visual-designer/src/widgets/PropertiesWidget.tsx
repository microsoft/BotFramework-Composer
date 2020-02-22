// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { generateSDKTitle } from '@bfc/shared';

import { ObiColors } from '../constants/ElementColors';
import { FormCard } from '../components/nodes/templates/FormCard';
import { ListOverview } from '../components/common/ListOverview';
import { WidgetContainerProps, WidgetComponent } from '../schema/uischema.types';
import { NodeMenu } from '../components/menus/NodeMenu';
import { PropertyAssignmentSize, AssignmentMarginTop } from '../constants/ElementSizes';

export const AssignmentList = ({ assignments, elementSchema }) => {
  if (!Array.isArray(assignments)) {
    return null;
  }
  const items = assignments.map(assignment => `${assignment.property} = ${assignment.value}`);
  return (
    <div data-testid="SetProperties" css={{ padding: '0 0 16px 8px' }}>
      <ListOverview
        items={items}
        elementSchema={elementSchema}
        maxCount={3}
        role="assignment"
        styles={{
          height: PropertyAssignmentSize.height,
          width: PropertyAssignmentSize.width,
          marginTop: AssignmentMarginTop,
        }}
      />
    </div>
  );
};
export interface PropertiesWidgetProps extends WidgetContainerProps {
  title: string;
  content: { [key: string]: any };
  menu?: JSX.Element | string;
  children?: JSX.Element;
  size?: {
    width: number;

    height: number;
  };
  colors?: {
    theme: string;
    icon: string;
  };
}

const DefaultCardColor = {
  theme: ObiColors.AzureGray3,
  icon: ObiColors.AzureGray2,
};

export const PropertiesWidget: WidgetComponent<PropertiesWidgetProps> = ({
  id,
  data,
  onEvent,
  title,
  disableSDKTitle,
  icon,
  menu,
  content,
  size,
  colors = DefaultCardColor,
}) => {
  const header = disableSDKTitle ? title : generateSDKTitle(data, title);
  const nodeColors = { themeColor: colors.theme, iconColor: colors.icon };
  const { assignments, elementSchema } = content;
  return (
    <FormCard
      header={header}
      corner={menu === 'none' ? null : menu || <NodeMenu id={id} onEvent={onEvent} />}
      icon={icon}
      nodeColors={nodeColors}
      styles={{ ...size }}
    >
      {assignments && <AssignmentList assignments={assignments} elementSchema={elementSchema} />}
    </FormCard>
  );
};
