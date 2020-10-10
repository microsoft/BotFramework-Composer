// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRef, useEffect, ReactNode } from 'react';
import { ZoomInfo } from '@bfc/shared';

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
      const rate = ScrollZoom(divRef.current as HTMLElement, event.deltaY, rateList, maxRate, minRate, currentRate);
      updateZoomRate(rate);
    }
  };

  useEffect(() => {
    if (zoomRateInfo) {
      divRef.current?.addEventListener('wheel', onWheel, { passive: false });
    }
    return () => divRef.current?.removeEventListener('wheel', onWheel);
  }, [zoomRateInfo]);

  return <div ref={divRef}>{children}</div>;
};
