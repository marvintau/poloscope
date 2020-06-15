import {cloneElement, useRef, useEffect, useState} from 'react';

import useResizeObserver from './useResizeObserver';

const Measurer = ({children, height:origHeight, callback, ...props}) => {

  const ref = useRef(null)

  const [measured, markMesured] = useState(false);

  const {height: resizedHeight} = useResizeObserver(ref.current);

  useEffect(() => {
    if (resizedHeight === undefined){
      const {height: initialHeight} = ref.current.getBoundingClientRect();
      callback(initialHeight, {...props, measured});
    } else {
      // console.log('resize observed', props);
      if (!measured) {
        markMesured(true);
      }
      callback(resizedHeight, {...props, measured})  
    }
  }, [origHeight, resizedHeight, callback])

  return cloneElement(children, {ref})
}

export default Measurer;