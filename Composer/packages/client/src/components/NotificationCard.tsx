// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css, keyframes } from '@emotion/core';
import { IconButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { useEffect, useRef, useState } from 'react';
import { FontSizes } from '@uifabric/fluent-theme';
import { Shimmer, ShimmerElementType } from 'office-ui-fabric-react/lib/Shimmer';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';

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
    box-shadow: 0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108);
    width: 340px;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
    animation-duration: ${show ? '0.467' : '0.2'}s;
    animation-timing-function: ${show ? 'cubic-bezier(0.1, 0.9, 0.2, 1)' : 'linear'};
    animation-fill-mode: both;
    animation-name: ${show ? fadeIn : fadeOut(height)};
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

const cardType = css`
  margin-top: 4px;
  color: #a80000;
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

const linkButton = css`
  color: #0078d4;
  float: right;
  font-size: 12px;
  height: auto;
`;

const getShimmerStyles = {
  root: {
    marginTop: '12px',
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

export enum NotificationType {
  info = 1,
  warning,
  error,
  loading,
}

export interface ILink {
  label: string;
  onClick: () => void;
}

export interface ICardProps {
  title: string;
  description: string;
  type: NotificationType;
  retentionTime?: number;
  link?: ILink;
  onRenderCardContent?: (props: ICardProps) => JSX.Element;
}

export interface INotificationProps {
  id: string;
  cardProps: ICardProps;
  onDismiss: (id: string) => void;
}

export class Timer {
  timerId: NodeJS.Timeout;
  start: number;
  remaining: number;
  pausing = false;
  callback: () => void;

  constructor(callback: () => void, delay: number) {
    this.remaining = delay;
    this.callback = callback;
    this.start = Date.now();
    this.timerId = setTimeout(callback, this.remaining);
  }

  pause() {
    if (!this.pausing) {
      clearTimeout(this.timerId);
      this.remaining -= Date.now() - this.start;
      this.pausing = true;
    }
  }

  resume() {
    this.pausing = false;
    this.start = Date.now();
    clearTimeout(this.timerId);
    this.timerId = setTimeout(this.callback, this.remaining);
  }

  clear() {
    clearTimeout(this.timerId);
  }
}

const renderCardContent = (props: ICardProps) => {
  const { title, description, type, link } = props;
  return (
    <div css={cardContent}>
      {type === NotificationType.error && <Icon css={cardType} iconName="ErrorBadge" />}
      <div css={cardDetail}>
        <div css={cardTitle}>{title}</div>
        <div css={cardDescription}>{description}</div>
        {link && (
          <ActionButton css={linkButton} onClick={link.onClick}>
            {link.label}
          </ActionButton>
        )}
        {type === NotificationType.loading && (
          <Shimmer shimmerElements={[{ type: ShimmerElementType.line, height: 2 }]} styles={getShimmerStyles} />
        )}
      </div>
    </div>
  );
};

export const NotificationCard = (props: INotificationProps) => {
  const { cardProps, id, onDismiss } = props;
  const [show, setShow] = useState(true);
  const containerRef = useRef(null);

  const removeNotification = () => {
    setShow(false);
  };

  // notification will disappear in 5 secs
  const timer = useRef(cardProps.retentionTime ? new Timer(removeNotification, cardProps.retentionTime) : null).current;

  useEffect(() => {
    return () => {
      if (timer) {
        timer.clear();
      }
    };
  }, []);

  const handleMouseOver = () => {
    if (timer) {
      timer.pause();
    }
  };

  const handleMouseLeave = () => {
    if (timer) {
      timer.resume();
    }
  };

  const handleAnimationEnd = () => {
    if (!show) onDismiss(id);
  };

  let renderCard = renderCardContent;
  if (cardProps.onRenderCardContent) renderCard = cardProps.onRenderCardContent;

  return (
    <div
      ref={containerRef}
      css={cardContainer(show, containerRef.current)}
      role="presentation"
      onAnimationEnd={handleAnimationEnd}
      onFocus={() => {}}
      onMouseLeave={handleMouseLeave}
      onMouseOver={handleMouseOver}
    >
      <IconButton
        ariaLabel={formatMessage('Close')}
        css={cancelButton}
        iconProps={{ iconName: 'Cancel', styles: { root: { fontSize: '12px' } } }}
        onClick={removeNotification}
      />
      {renderCard(cardProps)}
    </div>
  );
};
