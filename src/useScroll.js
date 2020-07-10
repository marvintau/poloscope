import { useRef, useState, useEffect } from "react";

const hasNativePerformanceNow =
  typeof performance === 'object' && typeof performance.now === 'function';

const now = hasNativePerformanceNow
  ? () => performance.now()
  : () => Date.now();

const DEBOUNCE_INTERVAL = 1000;

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
    return () => {
      cancelAnimationFrame(timeoutID.current);
      timeoutID.current = null;
    }
  }, [isScrolling]);

  return {
    onScroll,
    setScrollOffset: setOffset,
    isScrolling,
    scrollOffset,
    scrollOffsetDelta,
  }
};
