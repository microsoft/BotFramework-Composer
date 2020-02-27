// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { generateSDKTitle } from '@bfc/shared';
import React from 'react';

import { ObiColors } from '../constants/ElementColors';
import { ListOverviewCard } from '../components/nodes/templates/ListOverviewCard';
import { ListOverview } from '../components/common/ListOverview';
import { WidgetContainerProps } from '../schema/uischema.types';
import { NodeMenu } from '../components/menus/NodeMenu';

export interface ListOverviewWidgetProps extends WidgetContainerProps {
  title: string;
  content: { [key: string]: any };
  menu?: JSX.Element | string;
  children?: JSX.Element;
  size?: {
    width: number;

    height: number;
  };
  itemSize?: {
    width: number;
    height: number;
    marginTop: number;
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

export const ListOverviewWidget = Component => {
  return class extends React.Component<ListOverviewWidgetProps, object> {
    renderItems(items, itemSize, Render) {
      if (!Array.isArray(items)) {
        return null;
      }
      const ItemRender = ({ children }) => (
        <Render
          css={{
            height: itemSize.height,
            width: itemSize.width,
            marginTop: itemSize.marginTop,
          }}
        >
          {children}
        </Render>
      );
      return (
        <div css={{ padding: '0 0 8px 8px' }}>
          <ListOverview
            items={items}
            ItemRender={ItemRender}
            maxCount={3}
            styles={{
              height: itemSize.height,
              width: itemSize.width,
              marginTop: itemSize.marginTop,
            }}
          />
        </div>
      );
    }
    render() {
      const {
        id,
        data,
        onEvent,
        title,
        disableSDKTitle,
        icon,
        menu,
        content,
        items,
        itemSize,
        size,
        colors = DefaultCardColor,
      } = this.props;
      const header = disableSDKTitle ? title : generateSDKTitle(data, title);
      const nodeColors = { themeColor: colors.theme, iconColor: colors.icon };
      return (
        <ListOverviewCard
          header={header}
          corner={menu === 'none' ? null : menu || <NodeMenu id={id} onEvent={onEvent} />}
          icon={icon}
          label={content}
          nodeColors={nodeColors}
          styles={{ ...size }}
        >
          {items && this.renderItems(items, itemSize, Component)}
        </ListOverviewCard>
      );
    }
  };
};
