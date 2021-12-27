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

const getClassNames = (theme: ITheme, props: Pick<HelpTooltipProps, 'styles'>) =>
  mergeStyleSets(
    {
      root: {
        display: 'flex',
        padding: '5px',
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
  iconName?: string;
  styles?: HelpTooltipStyles;
};

const useClassNames = <Styles,>(styles: Styles) => useMemo(() => getClassNames(getTheme(), { styles }), [styles]);

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ iconName = 'Unknown', ...props }) => {
  const classNames = useClassNames(props.styles);
  return (
    <TooltipHost {...props} styles={classNames}>
      <Icon aria-label={props['aria-label']} className={classNames.helpIcon} iconName={iconName} tabIndex={0} />
    </TooltipHost>
  );
};

HelpTooltip.displayName = 'HelpTooltip';
