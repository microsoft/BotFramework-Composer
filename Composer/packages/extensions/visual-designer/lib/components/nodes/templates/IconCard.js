// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Icon as FabricIcon } from 'office-ui-fabric-react/lib/Icon';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { Icon } from '../../decorations/icon';
var boxWidth = 240;
var boxHeight = 125;
var headerHeight = 40;
var contentHeight = boxHeight - headerHeight;
export var IconCard = function (_a) {
  var corner = _a.corner,
    label = _a.label,
    trigger = _a.trigger,
    summary = _a.summary,
    childDialog = _a.childDialog,
    icon = _a.icon,
    themeColor = _a.themeColor,
    iconColor = _a.iconColor,
    onClick = _a.onClick,
    onChildDialogClick = _a.onChildDialogClick;
  var containerStyle = {
    width: boxWidth,
    height: boxHeight,
    fontSize: '20px',
    cursor: 'pointer',
    overflow: 'hidden',
    backgroundColor: 'white',
    borderRadius: '2px',
    boxShadow: '0px 1.2px 3.6px rgba(0, 0, 0, 0.108), 0px 6.4px 14.4px rgba(0, 0, 0, 0.132)',
  };
  return jsx(
    'div',
    {
      className: 'card',
      css: containerStyle,
      'data-testid': 'IconCard',
      onClick: function (e) {
        e.stopPropagation();
        onClick();
      },
    },
    jsx(
      'div',
      {
        className: 'card__header',
        css: {
          width: '100%',
          height: headerHeight + 'px',
          backgroundColor: themeColor,
          fontFamily: 'Segoe UI',
          fontSize: '14px',
          lineHeight: '19px',
          color: 'black',
          position: 'relative',
        },
      },
      jsx(
        'div',
        { css: { padding: '10px 10px', fontSize: '14px', fontFamily: 'Segoe UI', lineHeight: '19px' } },
        label
      ),
      jsx('div', { css: { position: 'absolute', top: 10, right: 0 } }, corner)
    ),
    jsx(
      'div',
      {
        className: 'card__content',
        css: {
          width: '100%',
          height: contentHeight,
        },
      },
      jsx(
        'div',
        {
          css: {
            fontWeight: 400,
            padding: '5px 10px',
            fontSize: '14px',
            lineHeight: '19px',
            display: 'flex',
            alignItems: 'top',
          },
        },
        jsx(
          'div',
          { css: { width: 20, height: 20, marginRight: '10px', display: 'flex', alignItems: 'center' } },
          jsx(Icon, { color: iconColor, icon: icon, size: 20 })
        ),
        jsx(
          'div',
          {
            css: {
              height: '100%',
              width: 'calc(100% - 20px)',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              fontSize: '14px',
              lineHeight: '19px',
              fontFamily: 'Segoe UI',
            },
            title: typeof label === 'string' ? label : '',
          },
          trigger
        )
      ),
      jsx(
        'div',
        {
          css: {
            fontWeight: 400,
            padding: '5px 10px 3px',
            borderTop: '1px solid #EBEBEB',
            fontSize: '14px',
            lineHeight: '19px',
            display: 'flex',
            alignItems: 'top',
          },
        },
        jsx(
          'div',
          { css: { width: 20, height: 20, marginRight: '10px', display: 'flex', alignItems: 'center' } },
          jsx(Icon, { color: '#656565', icon: ElementIcon.MessageBot, size: 20 })
        ),
        jsx(
          'div',
          {
            css: {
              height: '100%',
              width: 'calc(100% - 20px)',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              fontSize: '14px',
              lineHeight: '19px',
              fontFamily: 'Segoe UI',
            },
            title: typeof label === 'string' ? label : '',
          },
          summary && jsx('div', null, summary)
        )
      ),
      jsx(
        'div',
        {
          style: {
            height: '100%',
            width: 'calc(100% - 20px)',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontSize: '14px',
            lineHeight: '19px',
            fontFamily: 'Segoe UI',
            padding: '0px 10px',
            paddingLeft: '40px',
          },
          title: typeof label === 'string' ? label : '',
        },
        childDialog &&
          jsx(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
              },
            },
            jsx(FabricIcon, {
              'data-testid': 'OpenIcon',
              iconName: 'OpenSource',
              style: { lineHeight: '12px', fontSize: '12px', color: 'blue', paddingRight: '5px' },
              onClick: function (e) {
                e.stopPropagation();
                onChildDialogClick();
              },
            }),
            jsx(
              'span',
              {
                style: {
                  cursor: 'pointer',
                  color: 'blue',
                },
                onClick: function (e) {
                  e.stopPropagation();
                  onChildDialogClick();
                },
              },
              childDialog
            )
          )
      )
    )
  );
};
IconCard.defaultProps = {
  onClick: function () {},
};
//# sourceMappingURL=IconCard.js.map
