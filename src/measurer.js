import {cloneElement, useRef, useEffect} from 'react';

import useResizeObserver from './useResizeObserver';

const Measurer = ({children, height:origHeight, callback, ...props}) => {

  const ref = useRef(null)

  const {height: resizedHeight} = useResizeObserver(ref.current);

  useEffect(() => {
    if (resizedHeight === undefined){
      const {height: initialHeight} = ref.current.getBoundingClientRect();
      callback(initialHeight, {...props, firstMeasure: true});
    } else {
      callback(resizedHeight, props)  
    }
  }, [origHeight, callback])

  return cloneElement(children, {ref})
}

export default Measurer;