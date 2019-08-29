import { PropTypes } from 'prop-types';
import React, { Fragment, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import './index.css';
import { cssTransition, header } from './styles';

/**
 * Sample Collapse component
 * Usage:
 * <Collapse title={'your title'}>
 *   your content
 * </Collapse>
 */

export const Collapse = ({ title = '', children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Fragment>
      <div
        className="collapse-header"
        css={header}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <IconButton iconProps={{ iconName: isOpen ? 'ChevronDown' : 'ChevronRight' }} />
        <div>{title}</div>
      </div>
      <div className="collapse-content">
        <CollapseContent isOpen={isOpen}>{children}</CollapseContent>
      </div>
    </Fragment>
  );
};

Collapse.propTypes = {
  title: PropTypes.string,
  children: PropTypes.element,
};

const COLLAPSED = 'collapsed';
const COLLAPSING = 'collapsing';
const EXPANDING = 'expanding';
const EXPANDED = 'expanded';

function CollapseContent({
  className,
  children,
  transition,
  render,
  layoutEffect,
  isOpen,
  collapseHeight,
  onInit,
  onChange,
  ...attrs
}) {
  const contentRef = useRef(null);
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
    if (callback) {
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
    return `${contentRef.current.scrollHeight}px`;
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
      style={style}
      className={className}
      css={cssTransition}
      onTransitionEnd={onTransitionEnd}
      {...attrs}
    >
      {typeof render === 'function' ? render(collapseState) : children}
    </div>
  );
}

function nextFrame(callback) {
  // Ensure it is always visible on collapsing, afterFrame didn't work
  requestAnimationFrame(() => requestAnimationFrame(callback));
}

function isMoving(collapseState) {
  return collapseState === EXPANDING || collapseState === COLLAPSING;
}
