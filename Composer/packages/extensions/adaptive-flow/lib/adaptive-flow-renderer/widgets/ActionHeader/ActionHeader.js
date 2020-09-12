// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { useContext } from 'react';
import { jsx } from '@emotion/core';
import { generateSDKTitle } from '@bfc/shared';
import { DefaultColors } from '../../constants/ElementColors';
import { RendererContext } from '../../contexts/RendererContext';
import { DisabledIconColor } from '../styles/DisabledStyle';
import { Icon, BuiltinIcons } from './icon';
import { HeaderContainerCSS, HeaderBodyCSS, HeaderTextCSS, DisabledHeaderContainerCSS, DisabledHeaderTextCSS, } from './ActionHeaderStyle';
export var ActionHeader = function (_a) {
    var id = _a.id, data = _a.data, onEvent = _a.onEvent, _b = _a.title, title = _b === void 0 ? '' : _b, disableSDKTitle = _a.disableSDKTitle, icon = _a.icon, menu = _a.menu, _c = _a.colors, colors = _c === void 0 ? DefaultColors : _c;
    var disabled = data.disabled === true;
    var containerCSS = disabled ? DisabledHeaderContainerCSS : HeaderContainerCSS(colors.theme);
    var bodyCSS = HeaderBodyCSS;
    var textCSS = disabled ? DisabledHeaderTextCSS : HeaderTextCSS(colors.color);
    var iconColor = disabled ? DisabledIconColor : colors.icon;
    var headerContent = disableSDKTitle ? title : generateSDKTitle(data, title);
    var NodeMenu = useContext(RendererContext).NodeMenu;
    var menuNode = menu === 'none' ? null : menu || jsx(NodeMenu, { colors: colors, nodeData: data, nodeId: id, onEvent: onEvent });
    return (jsx("div", { css: containerCSS },
        jsx("div", { css: bodyCSS },
            icon && icon !== BuiltinIcons.None && (jsx("div", { "aria-hidden": true, css: {
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '5px',
                } },
                jsx(Icon, { color: iconColor, icon: icon, size: 16 }))),
            jsx("div", { "aria-label": headerContent, css: textCSS }, headerContent)),
        jsx("div", null, menuNode)));
};
//# sourceMappingURL=ActionHeader.js.map