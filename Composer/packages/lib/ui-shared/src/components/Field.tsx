// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Dropdown, IDropdownProps, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useCallback, useMemo } from 'react';
import { TextField as FluentTextField, ITextFieldProps, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IStyleFunctionOrObject, IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import { getTheme, mergeStyleSets, ITheme } from 'office-ui-fabric-react/lib/Styling';

import { HelpTooltip } from './HelpTooltip';

import { HelpTooltipStyles } from '.';

type LabelWithTooltipProps<Props, Styles> = Omit<Props, 'styles'> & {
  tooltip?: string;
  tooltipIconName?: string;
  styles?: IStyleFunctionOrObject<
    never,
    // @ts-expect-error: subComponentStyles won't match the exact component's interface
    // but the resulting type is still valid
    Styles & {
      subComponentStyles: {
        /** Styling for HelpTooltip child component */
        helpTooltip: HelpTooltipStyles;
      };
    }
  >;
};

const getClassNames = (
  theme: ITheme,
  props: {
    styles?: IStyleFunctionOrObject<unknown, {}>;
  }
) =>
  mergeStyleSets(
    {
      subComponentStyles: {
        helpTooltip: {},
        label: {
          root: {
            selectors: {
              '::after': {
                paddingRight: '0',
              },
            },
          },
        },
      },
    },
    props.styles
  );

const useClassNames = <Styles,>(styles: Styles) => useMemo(() => getClassNames(getTheme(), { styles }), [styles]);

const useOnRenderLabelWithHelpTooltip = <Props, Styles>(props: LabelWithTooltipProps<Props, Styles>) => {
  const classNames = useClassNames(props.styles);

  return useCallback<IRenderFunction<Props>>(
    (componentProps, defaultRender) => (
      <Stack horizontal verticalAlign="center">
        {componentProps && defaultRender && defaultRender(componentProps)}
        {props.tooltip && (
          <HelpTooltip
            aria-label={props.tooltip}
            content={props.tooltip}
            iconName={props.tooltipIconName}
            styles={classNames.subComponentStyles.helpTooltip}
          />
        )}
      </Stack>
    ),
    [classNames, props.tooltip, props.tooltipIconName]
  );
};

export type DropdownFieldProps = LabelWithTooltipProps<IDropdownProps, IDropdownStyles>;

export const DropdownField: React.FC<DropdownFieldProps> = (props) => {
  const onRenderLabel: IRenderFunction<IDropdownProps> = useOnRenderLabelWithHelpTooltip(props);
  const classNames = useClassNames(props.styles);
  return <Dropdown {...props} styles={classNames} onRenderLabel={onRenderLabel} />;
};

DropdownField.displayName = 'DropdownField';

export type TextFieldProps = LabelWithTooltipProps<ITextFieldProps, ITextFieldStyles>;

export const TextField: React.FC<TextFieldProps> = (props) => {
  const onRenderLabel: IRenderFunction<ITextFieldProps> = useOnRenderLabelWithHelpTooltip(props);
  const classNames = useClassNames(props.styles);
  return <FluentTextField {...props} styles={classNames} onRenderLabel={onRenderLabel} />;
};

TextField.displayName = 'TextField';
