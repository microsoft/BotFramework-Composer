// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FluentTheme } from '@uifabric/fluent-theme';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import {
  TooltipHost,
  ITooltipHostProps,
  ITooltipHostStyles,
  ITooltipHostStyleProps,
} from 'office-ui-fabric-react/lib/Tooltip';
import React, { useMemo } from 'react';
import { mergeStyleSets, getFocusStyle, getTheme, ITheme, IStyle } from 'office-ui-fabric-react/lib/Styling';
import { IStyleFunctionOrObject } from 'office-ui-fabric-react/lib/Utilities';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';

const getClassNames = (theme: ITheme, props: Pick<HelpTooltipProps, 'styles'>) =>
  mergeStyleSets(
    {
      root: {
        display: 'flex',
        padding: '5px',
        cursor: 'default',
      },
      helpIcon: [
        {
          color: FluentTheme.palette.neutralPrimary,
          userSelect: 'none',
          height: '1em',
        },
        getFocusStyle(theme, {
          inset: -3,
        }),
      ],
    },
    props.styles
  );

export type HelpTooltipStyles = IStyleFunctionOrObject<
  Partial<ITooltipHostStyleProps>,
  ITooltipHostStyles & {
    helpIcon?: IStyle;
  }
>;

export type HelpTooltipProps = Omit<ITooltipHostProps, 'styles'> & {
  iconProps?: IIconProps & { 'data-testid'?: string };
  styles?: HelpTooltipStyles;
};

const useClassNames = <Styles,>(styles: Styles) => useMemo(() => getClassNames(getTheme(), { styles }), [styles]);

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ iconProps, ...props }) => {
  const classNames = useClassNames(props.styles);
  return (
    <TooltipHost {...props} styles={classNames}>
      <Icon
        aria-label={props['aria-label']}
        className={classNames.helpIcon}
        iconName="Unknown"
        tabIndex={0}
        {...iconProps}
      />
    </TooltipHost>
  );
};

HelpTooltip.displayName = 'HelpTooltip';
