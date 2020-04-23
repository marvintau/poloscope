import React, {forwardRef, useState, useEffect} from 'react';
import List from 'poloscope';

import './index.css';

const DefaultHeader = forwardRef((props, ref) => {

  const headerStyle = {
    backgroundColor: 'rgb(255, 255, 255, 0.8)',
    position: 'sticky',
    top: '0px',
    width:'100%',
    height: 50,
    zIndex: '2'
  };

  return <div style={headerStyle}>
    <div style={{height:'100%', display:'flex', alignItems:'center', paddingLeft: '20px', fontWeight: 300}} ref={ref}>
      Put your customized header here.
    </div>
  </div>
})

const Item = forwardRef(({index, data:{height, text}, bound}, ref) => {

  // **style of outermost level**
  // 
  // position:absolute is manadatory, so that to anchor over
  // the closest parent DOM. and always merge the bound into
  // the inline style of actual DOM, for proper position and
  // height.
  const outerStyle = {
    position:'absolute',
    width:'100%',
    asdasdasd:'123',
    ...bound
  }

  const innerStyle = {
    height,
    display:'flex',
    paddingLeft:'20px',
    alignItems: 'center',
    // borderBottom:'1px solid black',
    boxSizing:'border-box',
    whiteSpace: 'pre',
    fontFamily: '"TheSansMono Office", "Droid Sans Mono", Menlo, Consolas, monospace',
    letterSpacing: '-1px',
    backgroundColor: index % 2 ? 'rgb(128, 128, 128, 0.2)' : 'white'
  }

  // **placing of ref**
  // Ref should be placed to the layer that actually affects
  // the height.
  return <div style={outerStyle}><div style={innerStyle} ref={ref}>{text}</div></div>
})

const App = () => {
  
  let marked = false;

  const listData = [...Array(500000)].map((_, i) => {

    let text = `${i.toString().padEnd(7, ' ')} Randomly generated string:\n        ${Math.random().toString(36).slice(7, 12)}`;

    if (marked){
      text = 'and it works well.';
      marked = false;
    }
    if (Math.random() > 0.95 && !marked){
      marked = true;
      text = 'You might have noticed that\nthe height of\nlines are not quite uniformed';
    }

    return {
      height: Math.random() * 40 + 40,
      text
    }
  });

  return <div>
    <h1>Rendering millions of records with no delay.</h1>
    <div className='wrapper'>
      <List {...{listData, Item, outerHeight: 400, overscan: 20}} >
        <DefaultHeader />
      </List>
    </div>
    <content>来来来，你们感受一下。</content>
  </div>
}

export default App;
