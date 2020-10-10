// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRef, useEffect, ReactNode } from 'react';
import { ZoomInfo } from '@bfc/shared';
import { IconButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';

function ScrollZoom(
  container: HTMLElement,
  delta: number,
  rateList: number[],
  maxRate: number,
  minRate: number,
  currentRate: number
): number {
  if (!container) return currentRate;

  const target = container.children[0] as HTMLElement;
  let rate: number = currentRate;

  if (delta < 0) {
    // Zoom in
    rate = rateList[rateList.indexOf(currentRate) + 1] || rate;
    rate = Math.min(maxRate, rate);
  } else {
    // Zoom out
    rate = rateList[rateList.indexOf(currentRate) - 1] || rate;
    rate = Math.max(minRate, rate);
  }
  target.style.transform = `scale(${rate})`;
  return rate;
}

interface ZoomZoneProps {
  zoomRateInfo: ZoomInfo;
  updateZoomRate: (currentRate: number) => void;
  children?: ReactNode;
}
export const ZoomZone: React.FC<ZoomZoneProps> = ({ zoomRateInfo, updateZoomRate, children }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const { rateList, maxRate, minRate, currentRate } = zoomRateInfo || {
    rateList: [0.75, 1, 3],
    maxRate: 3,
    minRate: 0.75,
    currentRate: 1,
  };
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.ctrlKey) {
      handleZoom(event.deltaY);
    }
  };

  const handleZoom = (delta: number) => {
    const rate = ScrollZoom(divRef.current as HTMLElement, delta, rateList, maxRate, minRate, currentRate);
    updateZoomRate(rate);
  };

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
      },
      rootHovered: {
        backgroundColor: 'rgba(44, 41, 41, 0.8)',
      },
    };
    return (
      <div css={buttonBoxStyle}>
        <IconButton iconProps={iconStyle('in')} styles={buttonStyle} onClick={() => handleZoom(-100)}></IconButton>
        <IconButton iconProps={iconStyle('out')} styles={buttonStyle} onClick={() => handleZoom(100)}></IconButton>
      </div>
    );
  };
  useEffect(() => {
    if (zoomRateInfo) {
      divRef.current?.addEventListener('wheel', onWheel, { passive: false });
    }
    return () => divRef.current?.removeEventListener('wheel', onWheel);
  }, [zoomRateInfo]);

  return (
    <div ref={divRef}>
      {children}
      {buttonRender()}
    </div>
  );
};
