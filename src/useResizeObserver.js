import {useState, useRef, useEffect, useCallback} from 'react';

export default (node) => {

  const [rect, setRect] = useState({});
  const obs = useRef(null);

  const watch = useCallback(() => {
    obs.current = new ResizeObserver(([{contentRect}]) => {
      setRect(contentRect)
    });

    
    node && obs.current.observe(node);
  }, [node]);

  const detach = useCallback(() => {
    obs.current && obs.current.disconnect();
  }, []);

  useEffect(() => {
    watch();
    return () => detach();
  }, [watch, detach]);

  return rect
}
