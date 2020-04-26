import React from 'react';
import { Transition } from 'react-transition-group';

export default ({barHeight, offset, isScrolling}) => {

  const duration = 100;

  const style = {
    position:'absolute',
    backgroundColor:'rgb(128, 128, 128, 0.7)',
    margin: '0px 3px',
    top:offset,
    right:0,
    width: 7,
    height: barHeight,
    willChange: 'transform',
    borderRadius: 3.5,
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: 0,
  }

  return <Transition in={isScrolling} timeout={duration}>
    {state => <div style={{...style, opacity: ['entering', 'entered'].includes(state) ? 1 : 0}} />}
  </Transition>
}