// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/react';
import { FluentTheme } from '@fluentui/theme';
import { Icon } from '@fluentui/react/lib/Icon';
import {
  TooltipHost,
  ITooltipHostProps,
  ITooltipHostStyles,
  ITooltipHostStyleProps,
} from '@fluentui/react/lib/Tooltip';
import React, { useMemo } from 'react';
import { mergeStyleSets, getFocusStyle, getTheme, ITheme, IStyle } from '@fluentui/react/lib/Styling';
import { IStyleFunctionOrObject } from '@fluentui/react/lib/Utilities';
import { IIconProps } from '@fluentui/react/lib/Icon';

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
  'aria-label': string;
  iconProps?: IIconProps & { 'data-testid'?: string };
  styles?: HelpTooltipStyles;
};

const useClassNames = <Styles,>(styles: Styles) => useMemo(() => getClassNames(getTheme(), { styles }), [styles]);

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ iconProps, ...props }) => {
  const classNames = useClassNames(props.styles);
  return (
    <TooltipHost {...props} styles={classNames}>
      <Icon
        data-is-focusable
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
