import React, {forwardRef} from 'react';
import Autosizer from 'react-virtualized-auto-sizer';
import List from 'poloscope';

import './index.css';

const DefaultHeader = forwardRef((props, ref) => {

  return <div style={{height:'100%', display:'flex', alignItems:'center', paddingLeft: '20px', fontWeight: 300}} ref={ref}>
    Put your customized header here.
  </div>
})

const Row = forwardRef(({index, data:{height, text}, style}, ref) => {

  // **style of outermost level**
  // 
  // position:absolute is manadatory, so that to anchor over
  // the closest parent DOM. and always merge the bound into
  // the inline style of actual DOM, for proper position and
  // height.
  const outerStyle = {
    width:'100%',
    ...style
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

  const itemData = [...Array(5000)].map((_, i) => {

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

  return <div style={{height: '100vh', display:'flex', flexDirection:'column', overflow:'auto'}}>
    <div className="h1" >Rendering millions of records with no delay.</div>
    <div style={{height: '100%'}}>
      <Autosizer disableWidth={true}>
        {({height}) => {
          return <List {...{itemData, Row, height, overscan: 1}} >
            <DefaultHeader />
          </List>
        }}
      </Autosizer>
    </div>
    <div className="content">来来来，你们感受一下。</div>
  </div>
}

export default App;
