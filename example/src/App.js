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

const App = () => {
  
  const listData = [...Array(500000)].map((_, i) => {
    return `${i.toString().padStart(7, ' ')} Randomly generated string: ${Math.random().toString(36).slice(7, 12)}`
  });

  return <div>
    <h1>Rendering millions of records with no delay.</h1>
    <div className='wrapper'>
      <List {...{listData, outerHeight: 400, overscan: 20}} >
        <DefaultHeader />
      </List>
    </div>
    <content>感受一下</content>
  </div>
}

export default App;
