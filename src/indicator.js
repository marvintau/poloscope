import React from 'react';

export default ({barHeight, offset}) => {
  const style = {
    position:'absolute',
    backgroundColor:'rgb(128, 128, 128, 0.7)',
    margin: '0px 3px',
    top:offset,
    right:0,
    width: 7,
    height: barHeight,
    willChange: 'transform',
    borderRadius: 3.5
  }

  return <div {...{style}} >
  </div>
}