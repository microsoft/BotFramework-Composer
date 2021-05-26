// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRef, useEffect, ReactNode } from 'react';
import { ZoomInfo } from '@bfc/shared';
import { IconButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';

import { scrollNodeIntoView } from '../utils/scrollNodeIntoView';
import { AttrNames } from '../constants/ElementAttributes';

function scrollZoom(delta: number, rateList: number[], maxRate: number, minRate: number, currentRate: number): number {
  let rate: number = currentRate;

  if (delta < 0) {
    // Zoom in
    rate = rateList[rateList.indexOf(currentRate) + 1] || rate;
    rate = Math.min(maxRate, rate);
  } else if (delta > 0) {
    // Zoom out
    rate = rateList[rateList.indexOf(currentRate) - 1] || rate;
    rate = Math.max(minRate, rate);
  } else {
    rate = 1;
  }

  return rate;
}

interface ZoomZoneProps {
  flowZoomRate: ZoomInfo;
  focusedId: string;
  updateFlowZoomRate: (currentRate: number) => void;
  children?: ReactNode;
}

export const ZoomZone: React.FC<ZoomZoneProps> = ({ flowZoomRate, focusedId, updateFlowZoomRate, children }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const { rateList, maxRate, minRate, currentRate } = flowZoomRate || {
    rateList: [0.5, 1, 3],
    maxRate: 3,
    minRate: 0.5,
    currentRate: 1,
  };
  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
      handleZoom(event.deltaY);
    }
  };

  const handleZoom = (delta: number) => {
    const rate = scrollZoom(delta, rateList, maxRate, minRate, currentRate);

    updateFlowZoomRate(rate);
  };

  const container = divRef.current as HTMLElement;
  useEffect(() => {
    if (!container) return;
    const target = container.children[0] as HTMLElement;
    target.style.transform = `scale(${currentRate})`;
    target.style.transformOrigin = 'top left';
    container.scroll({
      top: (container.scrollWidth - container.clientWidth) / 2,
      left: (container.scrollHeight - container.clientHeight) / 2,
    });

    if (currentRate === 1) {
      scrollNodeIntoView(`[${AttrNames.SelectedId}="${focusedId}"]`);
    }
  }, [currentRate]);

  const buttonRender = () => {
    const buttonBoxStyle = css({ position: 'absolute', left: '25px', bottom: '25px', width: '35px' });
    const iconStyle = (zoom: string): IIconProps => {
      return zoom === 'in'
        ? { iconName: 'ZoomIn', styles: { root: { color: '#fff' } } }
        : { iconName: 'ZoomOut', styles: { root: { color: '#fff' } } };
    };
    const buttonStyle: IButtonStyles = {
      root: {
        width: '35px',
        height: '35px',
        background: 'rgba(44, 41, 41, 0.8)',
        borderRadius: '2px',
        margin: '2.5px 0',
        selectors: {
          ':disabled': {
            backgroundColor: '#BDBDBD',
          },
        },
      },
      rootHovered: {
        backgroundColor: 'rgba(44, 41, 41, 0.8)',
      },
      rootPressed: {
        backgroundColor: 'rgba(44, 41, 41, 0.8)',
      },
    };
    return (
      <div css={buttonBoxStyle}>
        <IconButton
          ariaLabel={formatMessage('Zoom in')}
          disabled={currentRate === maxRate}
          iconProps={iconStyle('in')}
          styles={buttonStyle}
          onClick={() => handleZoom(-100)}
        ></IconButton>
        <IconButton
          ariaLabel={formatMessage('Zoom out')}
          disabled={currentRate === minRate}
          iconProps={iconStyle('out')}
          styles={buttonStyle}
          onClick={() => handleZoom(100)}
        ></IconButton>
        <IconButton
          ariaLabel={formatMessage('Reset view')}
          styles={buttonStyle}
          onClick={() => {
            handleZoom(0);
            container.scrollTo({ top: 0 });
          }}
        >
          <svg fill="none" height="15" viewBox="0 0 15 15" width="15" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7.5 5.5C7.77604 5.5 8.03385 5.55208 8.27344 5.65625C8.51823 5.76042 8.73177 5.90365 8.91406 6.08594C9.09635 6.26823 9.23958 6.48177 9.34375 6.72656C9.44792 6.96615 9.5 7.22396 9.5 7.5C9.5 7.77604 9.44792 8.03646 9.34375 8.28125C9.23958 8.52083 9.09635 8.73177 8.91406 8.91406C8.73177 9.09635 8.51823 9.23958 8.27344 9.34375C8.03385 9.44792 7.77604 9.5 7.5 9.5C7.22396 9.5 6.96354 9.44792 6.71875 9.34375C6.47917 9.23958 6.26823 9.09635 6.08594 8.91406C5.90365 8.73177 5.76042 8.52083 5.65625 8.28125C5.55208 8.03646 5.5 7.77604 5.5 7.5C5.5 7.22396 5.55208 6.96615 5.65625 6.72656C5.76042 6.48177 5.90365 6.26823 6.08594 6.08594C6.26823 5.90365 6.47917 5.76042 6.71875 5.65625C6.96354 5.55208 7.22396 5.5 7.5 5.5ZM15 8H13.4766C13.4401 8.47917 13.3464 8.94531 13.1953 9.39844C13.0495 9.84635 12.8516 10.2682 12.6016 10.6641C12.3568 11.0547 12.0703 11.4141 11.7422 11.7422C11.4141 12.0703 11.0521 12.3594 10.6562 12.6094C10.2656 12.8542 9.84375 13.0521 9.39062 13.2031C8.94271 13.349 8.47917 13.4401 8 13.4766V15H7V13.4766C6.52083 13.4401 6.05469 13.349 5.60156 13.2031C5.15365 13.0521 4.73177 12.8542 4.33594 12.6094C3.94531 12.3594 3.58594 12.0703 3.25781 11.7422C2.92969 11.4141 2.64062 11.0547 2.39062 10.6641C2.14583 10.2682 1.94792 9.84635 1.79688 9.39844C1.65104 8.95052 1.5599 8.48438 1.52344 8H0V7H1.52344C1.5599 6.52083 1.65104 6.05729 1.79688 5.60938C1.94792 5.15625 2.14583 4.73438 2.39062 4.34375C2.64062 3.94792 2.92969 3.58594 3.25781 3.25781C3.58594 2.92969 3.94531 2.64323 4.33594 2.39844C4.73177 2.14844 5.15365 1.95052 5.60156 1.80469C6.04948 1.65365 6.51562 1.5599 7 1.52344V0H8V1.52344C8.48438 1.5599 8.95052 1.65365 9.39844 1.80469C9.84635 1.95052 10.2656 2.14844 10.6562 2.39844C11.0521 2.64323 11.4141 2.92969 11.7422 3.25781C12.0703 3.58594 12.3568 3.94792 12.6016 4.34375C12.8516 4.73438 13.0495 5.15625 13.1953 5.60938C13.3464 6.05729 13.4401 6.52083 13.4766 7H15V8ZM7.5 12.5C7.95833 12.5 8.40104 12.4401 8.82812 12.3203C9.25521 12.2005 9.65365 12.0339 10.0234 11.8203C10.3932 11.6016 10.7292 11.3411 11.0312 11.0391C11.3385 10.7318 11.599 10.3932 11.8125 10.0234C12.0312 9.65365 12.2005 9.25521 12.3203 8.82812C12.4401 8.40104 12.5 7.95833 12.5 7.5C12.5 7.04167 12.4401 6.59896 12.3203 6.17188C12.2005 5.74479 12.0312 5.34635 11.8125 4.97656C11.599 4.60677 11.3385 4.27083 11.0312 3.96875C10.7292 3.66146 10.3932 3.40104 10.0234 3.1875C9.65365 2.96875 9.25521 2.79948 8.82812 2.67969C8.40104 2.5599 7.95833 2.5 7.5 2.5C7.04167 2.5 6.59896 2.5599 6.17188 2.67969C5.74479 2.79948 5.34635 2.96875 4.97656 3.1875C4.60677 3.40104 4.26823 3.66146 3.96094 3.96875C3.65885 4.27083 3.39844 4.60677 3.17969 4.97656C2.96615 5.34635 2.79948 5.74479 2.67969 6.17188C2.5599 6.59896 2.5 7.04167 2.5 7.5C2.5 7.95833 2.5599 8.40104 2.67969 8.82812C2.79948 9.25521 2.96615 9.65365 3.17969 10.0234C3.39844 10.3932 3.65885 10.7318 3.96094 11.0391C4.26823 11.3411 4.60677 11.6016 4.97656 11.8203C5.34635 12.0339 5.74479 12.2005 6.17188 12.3203C6.59896 12.4401 7.04167 12.5 7.5 12.5Z"
              fill="white"
            />
          </svg>
        </IconButton>
      </div>
    );
  };

  // Using ref and eventListener instead of <div @wheel='xxx()' /> because passive property can not be set in <div @wheel='xxx()' />
  useEffect(() => {
    if (flowZoomRate) {
      divRef.current?.addEventListener('wheel', onWheel, { passive: false });
    }
    return () => divRef.current?.removeEventListener('wheel', onWheel);
  }, [flowZoomRate]);

  return (
    <div css={{ width: '100%', height: '100%' }}>
      <div ref={divRef} css={{ width: '100%', height: '100%', overflow: 'auto' }}>
        {children}
        {buttonRender()}
      </div>
    </div>
  );
};
