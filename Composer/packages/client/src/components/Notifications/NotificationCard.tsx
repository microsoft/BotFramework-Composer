// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/react';
import React, { useState } from 'react';
import { IconButton, ActionButton } from '@fluentui/react/lib/Button';
import { useRef } from 'react';
import { FontSizes, SharedColors } from '@fluentui/theme';
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';
import { Icon } from '@fluentui/react/lib/Icon';
import { Stack, IStackProps } from '@fluentui/react/lib/Stack';
import formatMessage from 'format-message';
import { Notification, NotificationLink } from '@botframework-composer/types';

import { useInterval } from '../../utils/hooks';

// -------------------- Styles -------------------- //

const fadeIn = keyframes`
	from { opacity: 0; transform: translate3d(40px,0,0) }
	to { opacity: 1; translate3d(0,0,0) }
`;

const fadeOut = (height: number) => keyframes`
	from { opacity: 1; height: ${height}px}
	to { opacity: 0; height:0}
`;

const cardContainer = (show: boolean, ref?: HTMLDivElement | null) => () => {
  let height = 100;
  if (ref) {
    height = ref.clientHeight;
  }

  return css`
    border-left: 4px solid #0078d4;
    background: white;
    box-shadow:
      0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132),
      0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108);
    width: 340px;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
    animation-duration: ${show ? '0.467' : '0.2'}s;
    animation-timing-function: ${show ? 'cubic-bezier(0.1, 0.9, 0.2, 1)' : 'linear'};
    animation-fill-mode: both;
    animation-name: ${show ? fadeIn : fadeOut(height)};
    pointer-events: auto;
  `;
};

const cancelButton = css`
  float: right;
  color: #605e5c;
  margin-left: auto;
  width: 24px;
  height: 24px;
`;

const cardContent = css`
  display: flex;
  padding: 0 8px 16px 12px;
  min-height: 64px;
`;

const cardDetail = css`
  margin-left: 8px;
  flex-grow: 1;
`;

const iconMargin = '4px';

// Error Block Icon from Messaging Colors
const errorType = css`
  margin-top: ${iconMargin};
  color: #a80000;
`;

// Success Icon from Messaging Colors
const successType = css`
  margin-top: ${iconMargin};
  color: #107c10;
`;

// #fce100
const warningType = css`
  margin-top: ${iconMargin};
  color: ${SharedColors.yellow10};
`;

// #0078d4
const questionType = css`
  margin-top: ${iconMargin};
  color: ${SharedColors.cyanBlue10};
`;

// #c19c00
const congratulationType = css`
  margin-top: ${iconMargin};
  color: ${SharedColors.orangeYellow10};
`;

const cardTitle = css`
  font-size: ${FontSizes.size16};
  lint-height: 22px;
  margin-right: 16px;
`;

const cardDescription = css`
  text-size-adjust: none;
  font-size: ${FontSizes.size10};
  margin-top: 8px;
  margin-right: 16px;
  word-break: break-word;
`;

const linkButton = {
  root: {
    padding: '0',
    border: '0',
  },
  label: {
    fontSize: '12px',
    color: SharedColors.cyanBlue10,
    margin: '0',
  },
  textContainer: {
    height: '16px',
  },
};

const getShimmerStyles = {
  root: {
    marginTop: '12px',
    marginBottom: '8px',
  },
  shimmerWrapper: [
    {
      backgroundColor: '#EDEBE9',
    },
  ],
  shimmerGradient: [
    {
      backgroundImage: 'radial-gradient(at 50% 50%, #0078D4 0%, #EDEBE9 100%);',
    },
  ],
};
// -------------------- NotificationCard -------------------- //
export type CardProps = Notification;
export type NotificationType = Notification['type'];

export type NotificationProps = {
  id: string;
  cardProps: CardProps;
  onDismiss: (id: string) => void;
  onHide?: (id: string) => void;
};

const makeLinkLabel = ({ label, onClick }: NotificationLink) => (
  <ActionButton styles={linkButton} onClick={onClick}>
    {label}
  </ActionButton>
);

const defaultCardContentRenderer = (props: CardProps) => {
  const { title, description, type, link, links, leftLinks, rightLinks } = props;

  const rightLinkList = rightLinks ?? links ?? [link];
  const leftLinkList = leftLinks ?? [];

  const stackProps: IStackProps = {
    horizontal: true,
    horizontalAlign: 'space-between',
    tokens: {
      childrenGap: '20px',
      padding: '0 16px 0 0',
      maxHeight: '24px',
    },
  };

  return (
    <div css={cardContent}>
      {type === 'error' && <Icon css={errorType} iconName="ErrorBadge" />}
      {type === 'success' && <Icon css={successType} iconName="Completed" />}
      {type === 'warning' && <Icon css={warningType} iconName="Warning" />}
      {type === 'question' && <Icon css={questionType} iconName="UnknownSolid" />}
      {type === 'congratulation' && <Icon css={congratulationType} iconName="Trophy2Solid" />}
      {type === 'custom' && (
        <Icon
          css={css`
            margin-top: ${iconMargin};
            color: ${props.color ?? SharedColors.gray10};
          `}
          iconName={props.icon ?? 'UnknownSolid'}
        />
      )}
      <div css={cardDetail}>
        <div css={cardTitle}>{title}</div>
        {description && <div css={cardDescription}>{description}</div>}
        <Stack horizontal horizontalAlign="space-between">
          <Stack {...stackProps}>
            {leftLinkList.map((link) => (
              <Stack.Item key={link.label}>{makeLinkLabel(link)}</Stack.Item>
            ))}
          </Stack>
          <Stack {...stackProps}>
            {rightLinkList.map(
              (link) => link != null && <Stack.Item key={link.label}>{makeLinkLabel(link)}</Stack.Item>,
            )}
          </Stack>
        </Stack>
        {type === 'pending' && (
          <Shimmer shimmerElements={[{ type: ShimmerElementType.line, height: 2 }]} styles={getShimmerStyles} />
        )}
      </div>
    </div>
  );
};

export const NotificationCard = React.memo((props: NotificationProps) => {
  const { cardProps, id, onDismiss, onHide } = props;
  const { hidden, retentionTime = null } = cardProps;

  const [delay, setDelay] = useState(retentionTime || null);
  const containerRef = useRef<HTMLDivElement>(null);

  const removeNotification = () => {
    typeof onHide === 'function' && onHide(id);
    setDelay(null);
  };

  useInterval(removeNotification, delay);

  const handleMouseOver = () => {
    if (retentionTime) {
      setDelay(null);
    }
  };

  const handleMouseLeave = () => {
    if (retentionTime) {
      setDelay(retentionTime);
    }
  };

  const renderCard = cardProps.onRenderCardContent || defaultCardContentRenderer;

  return (
    <div
      ref={containerRef}
      css={cardContainer(!hidden, containerRef.current)}
      role="presentation"
      onFocus={() => void 0}
      onMouseLeave={handleMouseLeave}
      onMouseOver={handleMouseOver}
    >
      <IconButton
        ariaLabel={formatMessage('Close')}
        css={cancelButton}
        iconProps={{ iconName: 'Cancel', styles: { root: { fontSize: '12px' } } }}
        onClick={() => {
          // This lets us add custom actions to closing a card if we want to.
          // For instance, telemetry to track when the user dismisses a specific
          // type of card.
          cardProps?.onDismiss?.(id);
          onDismiss(id);
        }}
      />
      {renderCard(cardProps)}
    </div>
  );
});
