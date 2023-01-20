// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { Fragment, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { FontSizes, FontWeights } from '@fluentui/react/lib/Styling';
import { Label } from '@fluentui/react/lib/Label';
import { NeutralColors } from '@fluentui/theme';
import formatMessage from 'format-message';
import { Icon } from '@fluentui/react/lib/Icon';
import styled from '@emotion/styled';

const styles = {
  title: css`
    font-weight: ${FontWeights.semibold};
  `,
  description: css`
    font-size: ${FontSizes.medium};
  `,
  transition: css`
    transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  `,
  header: css`
    appearance: none;
    border: none;
    background-color: #eff6fc;
    display: flex;
    margin: 4px -18px;
    align-items: center;
    width: auto;
  `,
};

const CollapseIcon = styled(Icon)({
  color: NeutralColors.gray150,
  marginRight: '4px',
});

interface CollapseField {
  defaultExpanded?: boolean;
  description?: string;
  title?: string | boolean;
}

export const CollapseField: React.FC<CollapseField> = ({ children, description, defaultExpanded, title }) => {
  const [isOpen, setIsOpen] = useState(!!defaultExpanded);

  return (
    <Fragment>
      <button
        data-is-focusable
        aria-expanded={isOpen}
        aria-label={typeof title === 'string' ? title : formatMessage('Field Set')}
        css={styles.header}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <CollapseIcon aria-hidden {...{ iconName: isOpen ? 'ChevronDown' : 'ChevronRight' }} />
        {title && <Label css={styles.title}>{title}</Label>}
        {description && <span css={styles.description}>&nbsp;- {description}</span>}
      </button>
      <div>
        <CollapseContent isOpen={isOpen}>{children}</CollapseContent>
      </div>
    </Fragment>
  );
};

const COLLAPSED = 'collapsed';
const COLLAPSING = 'collapsing';
const EXPANDING = 'expanding';
const EXPANDED = 'expanded';

interface CollapseContentProps {
  className?: string;
  collapseHeight?: number;
  isOpen: boolean;
  layoutEffect?: boolean;
  transition?: string;
  render?: (state: string) => React.FC;
  onChange?: () => void;
  onInit?: (_: any) => void;
}

const CollapseContent: React.FC<CollapseContentProps> = ({
  className,
  children,
  collapseHeight,
  isOpen,
  layoutEffect,
  render,
  transition,
  onChange,
  onInit,
  ...attrs
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [collapseState, setCollapseState] = useState(isOpen ? EXPANDED : COLLAPSED);
  const [collapseStyle, setCollapseStyle] = useState({
    height: isOpen ? null : getCollapseHeight(),
    visibility: isOpen ? null : getCollapsedVisibility(),
  });
  const [hasReversed, setHasReversed] = useState(false);
  const firstUpdate = useRef(true);

  const effect = layoutEffect ? useLayoutEffect : useEffect;
  effect(() => {
    if (!contentRef.current) return;

    if (firstUpdate.current) {
      onCallback(onInit);

      // Don't run effect on first render, the DOM styles are already correctly set
      firstUpdate.current = false;
      return;
    }

    switch (collapseState) {
      case EXPANDING:
        setExpanding();
        break;
      case COLLAPSING:
        setCollapsing();
        break;
      case EXPANDED:
        setExpanded();
        break;
      case COLLAPSED:
        setCollapsed();
        break;
      // no default
    }
  }, [collapseState]);

  function onCallback(callback) {
    if (typeof callback === 'function') {
      callback({
        collapseState,
        collapseStyle,
        hasReversed,
        isMoving: isMoving(collapseState),
      });
    }
  }

  function getCollapseHeight() {
    return collapseHeight || '0px';
  }

  function getCollapsedVisibility() {
    return collapseHeight ? '' : 'hidden';
  }

  function setCollapsed() {
    if (!contentRef.current) return;

    setCollapseStyle({
      height: getCollapseHeight(),
      visibility: getCollapsedVisibility(),
    });
    onCallback(onChange);
  }

  function setCollapsing() {
    if (!contentRef.current) return;

    const height = getContentHeight(); // capture height before setting it to async setState method

    setCollapseStyle({
      height,
      visibility: '',
    });

    nextFrame(() => {
      setCollapseStyle({
        height: getCollapseHeight(),
        visibility: '',
      });
      onCallback(onChange);
    });
  }

  function setExpanding() {
    nextFrame(() => {
      if (contentRef.current) {
        const height = getContentHeight(); // capture height before setting it to async setState method

        setCollapseStyle({
          height,
          visibility: '',
        });
        onCallback(onChange);
      }
    });
  }

  function setExpanded() {
    if (!contentRef.current) return;

    setCollapseStyle({
      height: '',
      visibility: '',
    });
    onCallback(onChange);
  }

  function getContentHeight() {
    return `${contentRef.current?.scrollHeight}px`;
  }

  function onTransitionEnd({ target, propertyName }) {
    if (target === contentRef.current && propertyName === 'height') {
      switch (collapseState) {
        case EXPANDING:
          setCollapseState(EXPANDED);
          break;
        case COLLAPSING:
          setCollapseState(COLLAPSED);
          break;
        // no default
      }
    }
  }

  // getDerivedStateFromProps
  const didOpen = collapseState === EXPANDED || collapseState === EXPANDING;

  if (!didOpen && isOpen) {
    setHasReversed(collapseState === COLLAPSING);
    setCollapseState(EXPANDING);
  }
  if (didOpen && !isOpen) {
    setHasReversed(collapseState === EXPANDING);
    setCollapseState(COLLAPSING);
  }
  // END getDerivedStateFromProps

  const style = {
    transition,
    ...collapseStyle,
  };

  return (
    <div
      ref={contentRef}
      className={className}
      css={styles.transition}
      style={style as React.CSSProperties}
      onTransitionEnd={onTransitionEnd}
      {...attrs}
    >
      {typeof render === 'function' ? render(collapseState) : children}
    </div>
  );
};

function nextFrame(callback) {
  // Ensure it is always visible on collapsing, afterFrame didn't work
  requestAnimationFrame(() => requestAnimationFrame(callback));
}

function isMoving(collapseState) {
  return collapseState === EXPANDING || collapseState === COLLAPSING;
}
