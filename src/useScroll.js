import { useRef, useState, useEffect } from "react";

const hasNativePerformanceNow =
  typeof performance === 'object' && typeof performance.now === 'function';

const now = hasNativePerformanceNow
  ? () => performance.now()
  : () => Date.now();

const DEBOUNCE_INTERVAL = 1000;

var timeoutID;

export default () => {

  const [isScrolling, setScrolling] = useState(false);
  const [scrollOffset, setOffset]= useState(0);
  const [scrollOffsetDelta, setOffsetDelta]= useState(0);

  function debounce(callback) {
    const start = now();
  
    function tick() {
      if (now() - start >= DEBOUNCE_INTERVAL) {
        cancelAnimationFrame(timeoutID);
        callback();
      } else {
        timeoutID = requestAnimationFrame(tick);
      }
    }
  
    timeoutID = requestAnimationFrame(tick);
  }
  
  const onScroll = (event) => {
    event.stopPropagation();
    event.preventDefault();
    // console.log('scroll fired');
    const { scrollTop } = event.currentTarget;
    if (scrollOffset !== scrollTop) {
      setScrolling(true);
      setOffsetDelta(scrollTop - scrollOffset);
      setOffset(scrollTop);
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
