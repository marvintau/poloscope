import React, { useRef, useState, useEffect } from "react";

const hasNativePerformanceNow =
  typeof performance === 'object' && typeof performance.now === 'function';

const now = hasNativePerformanceNow
  ? () => performance.now()
  : () => Date.now();

const DEBOUNCE_INTERVAL = 150;

const clip = (number, minBound, maxBound) => {
  return Math.max(minBound, Math.min(maxBound, number));
}

export default () => {

  const [isScrolling, setScrolling] = useState(false);
  const [scrollOffset, setOffset]= useState(0);
  const [scrollOffsetDelta, setOffsetDelta]= useState(0);

  const timeoutID = useRef(null);

  function debounce(callback) {
    const start = now();
  
    function tick() {
      if (now() - start >= DEBOUNCE_INTERVAL) {
        cancelAnimationFrame(timeoutID.current);
        callback();
      } else {
        timeoutID.current = requestAnimationFrame(tick);
      }
    }
  
    timeoutID.current = requestAnimationFrame(tick);
  }
  
  const onScroll = (event) => {
    // console.log('scroll fired');
    const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;

    if (scrollOffset !== scrollTop) {
      const newOffset = clip(scrollTop, 0, scrollHeight - clientHeight);

      setScrolling(true);
      setOffsetDelta(newOffset - scrollOffset);
      setOffset(newOffset);
    }
  }

  useEffect(() => {
    debounce(() => {
      setScrolling(false);
    })
  }, [isScrolling]);

  return {
    onScroll,
    setScrollOffset: setOffset,
    isScrolling,
    scrollOffset,
    scrollOffsetDelta,
  }
};
