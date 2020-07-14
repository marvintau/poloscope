import {cloneElement, useRef, useEffect, useState} from 'react';

import useResizeObserver from './useResizeObserver';

const Measurer = ({children, height:origHeight, callback, ...props}) => {

  const ref = useRef(null)

  const [measured, markMesured] = useState(false);

  const {height: resizedHeight} = useResizeObserver(ref.current);

  const handleResize = () => {
    (!measured) && markMesured(true);
    let newHeight;
    if (resizedHeight === undefined){
      const res = ref.current.getBoundingClientRect();
      newHeight = res.height;
    } else {
      newHeight = resizedHeight;
    }

    callback(newHeight, {...props, measured})
  }

  useEffect(() => {
    handleResize();
  }, [origHeight, resizedHeight])
  return cloneElement(children, {ref})
}

export default Measurer;