import React, {useRef, useState} from 'react';
import Indicator from './indicator';
import Measurer from './measurer';
import useScroll from './useScroll';

import styles from './styles.css';

const INDICATOR_BAR_HEIGHT = 60;

const findNearest = (min, max, test) =>{
  while (min <= max) {
    const mid = min + Math.floor((max - min) / 2);

    switch (test(mid)) {
      case "eq" : return mid;
      case 'lt' : max = mid - 1; break;
      case 'gt' : min = mid + 1; break;
      default:
        throw Error('invalid return')
    }
  }

  return (min > 0) ? min - 1 : 0;
};

// ### Note: List是如何进行渲染的
// 
// #### 首次（首屏）渲染
// 首次渲染时，List需要知道viewport范围内待渲染条目的index范围。而想要
// 知道这个范围我们必须要先知道每个条目的高度，而想要知道高度必须得依据
// **已经渲染了的**条目的DOM。所以首次渲染只能先给定一个大概的条目的高度，
// 在进行渲染之后，让条目在一个useEffect中更新其高度，并通知回List。
// 
// #### 滚动时重新渲染
// 在滚动的过程中我们不断渲染新的条目，然而经过reconciliation，不会有频繁的
// 条目增删操作。但是每个条目的偏移和高度都会计算并保存下来。
// 
// #### spontaneous重新渲染
// 如果某些组件会通过其他方式，譬如textarea resizing，或者带有添加或删除
// 项目元素的交互功能，那么也需要重新渲染。
// 
// 
// 特别重要：对于List控制重新渲染的途径只有一个，就是下方的updateOverallHeight。
// updateOverallHeight是最外层List的唯一参数，因此如果不更新overallHeight状态
// 就无法rerender。同时，由于所有List元素的高度及变化都会反映在OverallHeight
// 上，因此完全由overallHeight控制能保证所有元素在各种情况下发生高度变化时都能
// 重新渲染。（正确性及唯一性）
// 
export default ({itemData=[], Row, height:outerHeight, overscan=10, initialItemHeight=10, children}) => {

  const itemCount = itemData.length;

  const {
    isScrolling,
    scrollOffsetDelta,
    scrollOffset,
    // setScrollOffset,
    onScroll,
  } = useScroll();

  // **为什么在这里使用useRef而不是useState?**
  // 
  // useState有两个问题，首先setState的更新被送入一个队列，因此即使是与顺序无关的操作
  // 也会被强行变为顺序执行。其次每次setState都会造成re-rendering，但是对我们来说并不
  // 需要。
  // 
  // 而useRef则在hook中创建了一个mutable的数据结构，使得它不会受到re-rendering（也就
  // 是本函数重新执行的影响）我们可以直接向它异步地赋值。但是下方我们写了若干个引用变
  // 量，在每次re-rendering后这些变量也会跟着更新，因此可以把它们放在useEffect中，这
  // 样我们就可以在useEffect中实现节流/防抖的操作了。
  // 
  const dataRef = useRef({
    bounds: {},
    currentBottom: -1, 
    measuredBottom: -1, 
    itemsTop:0,
    itemsHeight: 0,
  });

  const calcOverallHeight = () => {
    const {
      itemsHeight,
      itemsTop,
      measuredBottom,
    } = dataRef.current;
    return itemsTop + itemsHeight + (itemCount - measuredBottom + 1) * initialItemHeight
  };

  const [overallHeight, setOverallHeight] = useState(calcOverallHeight());
  
  const updateOverallHeight = () => {
    setOverallHeight(calcOverallHeight());
  }

  const getIndicatorPosition = () => {
    const margin = 3;
    return margin + scrollOffset / (overallHeight - outerHeight) * (outerHeight - INDICATOR_BAR_HEIGHT - initialItemHeight - margin)
  }

  // # setItemHeight
  // 
  // **为什么只在这里更新currentBottom，而不直接调用下面那个updatePositionsTo？**
  // 
  // 因为updatePositionsTo开销较大，而我们并不确定setItemHeight被调用的顺序（它
  // 通常是由ResizeObserver的callback触发的，应当被看作异步操作）。因此我们设法将若
  // 干个item的位置计算集中到一次进行。详见下方useEffect。
  // 
  // **为什么不把currentBottom设为state而要存在ref里？**
  // 
  // setItemHeight由ResizeObserver发起，是异步和乱序的调用，而currentBottom只
  // 保留发起setItemHeight所有元素中index最小的那一个，和调用的顺序无关。如果
  // currentBottom是state，则意味着每次调用都会导致re-rendering，显然是多余的。
  // 在ref中保存的数据改变时不会触发re-render，是完美的hook中保存异步读写数据的
  // 方案。事实上我们会通过**节流**，使得尽量在一波setItemHeight结束后在进行re-
  // render。
 
  /**
   * ## setItemHeight
   * 
   * 计算条目高度，通过Measurer调用。
   * 
   * @param {number} index 
   * @param {number} height 
   */
  const setItemHeight = (currHeight, {index, measured}) => {
    // 1. **handling measureBottom & itemsHeight**
    if (index <= dataRef.current.measuredBottom){
      //    *  index within the measuredBottom, which means we are updating the height of
    //       a rendered item. Apply the difference of the curr & prev to overalHeight.
      const prevHeight = dataRef.current.bounds[index].height;
      dataRef.current.itemsHeight += currHeight - prevHeight;


    } else {
      // console.log('measure NEW', index, currHeight);
    //    *  index below the measuredBottom, which indicates that the element is just
    //       rendered and not measured yet. We update the newly conquered frontier,
    //       and the itemsHeight here.
      dataRef.current.measuredBottom = index;
      dataRef.current.itemsHeight += currHeight;
    }

    dataRef.current.bounds[index].height = currHeight;

    // 2. **invalidate all element positions below _index_. **
    // 
    //    New positions will be calculated when any of
    //    them is referred later.
    if (index < dataRef.current.currentBottom) {
      dataRef.current.currentBottom = index;
    }

    if (measured) {
      updateOverallHeight();
    }
  }

  // ## `updatePositionsTo`:
  // **为什么是从currentBottom到dest，而不是到measuredBottom？**
  // 
  // 考虑这样一个情景，我们需要用这个组件来渲染五百万行数据，并且这五百万行数据我们
  // 非常有耐心地拉到了底。此时measuredBottom就是4,999,999。然后第二行数据的高度增
  // 加了2px。如果是到measuredBottom，那么我们就必须要在下面的for循环中更新从第三行
  // 到第五百万行的位置。这显然没有必要，而应该是拉到哪里更新到哪里，因此这里是dest，
  // 也就是我们渲染的下边界的index。
  // 
  // **为什么不在这里面设置measuredBottom和itemsHeight？**
  //  
  // a) 我们需要在首次渲染之前就知道要渲染哪些元素，而测量过程要等到创建了Items之后
  //    才会调用。
  // 
  // b) 在后续的渲染中，因为这两个在调用setItemHeight的时候就都设置过了。由于在
  //    setItemHeight中标记了markUpdate，也就是说会确保强制刷新，因此在下次用到
  //    updatePositionsTo时不会有别的对这两个值的操作。
  // 
  // **为什么要重新获得一份currentBottom？**
  // 
  // a) 因为在Use

  /**
   * ## updatePositionsTo

   * 更新一定范围内的元素位置，仅被getItemBound调用。
   * 
   * @param {Integer} dest 要更新到的index
   */
  const updatePositionsTo = (dest, from) => {
    // console.log('updatePositionsTo', dest, from)
    const {currentBottom, itemsTop, bounds} = dataRef.current;

    if (currentBottom < 0) {
      dataRef.current.bounds[0] = {
        top: itemsTop,
        height: initialItemHeight,
        bottom: initialItemHeight + itemsTop};
    };

    for (let i = Math.max(0, currentBottom); i <= dest; i++) {
      const top = i === 0 ? itemsTop : bounds[i-1].bottom;
      const height = bounds[i] && bounds[i].height || initialItemHeight
      const bottom =  top + height;

      // console.log(`top: ${top} | height: ${height} | bottom: ${bottom}`);

      dataRef.current.bounds[i] = { top, height, bottom };
    }
  }

  const getItemBound = (index) => {

    // case that currentBottom is previously set by setItemHeight,
    // which means the positions of items below are invalidated, and
    // need to be calculated again.
    if (index > dataRef.current.currentBottom) {
      updatePositionsTo(index, 'GET-ITEM-BOUND');
      dataRef.current.currentBottom = index;
    }

    return dataRef.current.bounds[index];
  };
  
  const getStartIndex = () => {
    const {measuredBottom, itemsHeight} = dataRef.current;
    
    const test = (index) => {
      const {top:curr} = getItemBound(index);
      return curr > scrollOffset ? 'lt' : curr < scrollOffset ? 'gt' : 'eq';
    }

    const start = (scrollOffset < itemsHeight)
      ? findNearest(0, measuredBottom, test) 
      : measuredBottom + 1;

    const overscanBack = !isScrolling
      ? overscan
      : scrollOffsetDelta < 0
      ? overscan : 1;

    return {
      start,
      overStart: Math.max(0, start - overscanBack)
    }
  }


  const getStopIndex = (startIndex, itemCount)=> {
    
    const {bottom} = getItemBound(startIndex);

    let offset, stop;
    for (
      stop = startIndex, offset = bottom;
      stop < itemCount - 1 && offset < scrollOffset + outerHeight;
      stop += 1, offset += getItemBound(stop).height
    ) {
    };

    const overscanFore = !isScrolling
    ? overscan
    : scrollOffsetDelta > 0
    ? overscan : 1;

    return {
      stop: Math.min(itemCount - 1, stop),
      overStop : Math.max(0, Math.min(itemCount - 1, stop + overscanFore))
    }
  }

  const renderItems = () => {

    if (itemData.length > 0){
      const {overStart: start} = getStartIndex();
      const {overStop:  stop} = getStopIndex(start, itemData.length)

      const items = [];
      for (let index = start; index <= stop; index++) {
        const bound = getItemBound(index);
        const {height} = bound;
        items.push(<Measurer {...{key:index, height, callback:setItemHeight, index}}>
          <Row {...{index, data: itemData[index], style:{...bound, position:'absolute'}}} />
        </Measurer>)
      }
      // console.log(items.length, 'render items', start, stop);
      return items;
    } else {
      return [];
    }
  };
  
  const innerStyle = {
    position:'relative',
    height: overallHeight
  }
  return <div style={{position:'relative', height:outerHeight, overflow:'hidden'}}>
    <div id="scrollView" className={styles.outer} {...{style: {overflowY:'scroll', height:outerHeight}, onScroll}}>
      <div style={{position:'sticky', top:'0', height:'auto', zIndex: 10}}>
        {children}
      </div>
      <div className='inner-marker' style={innerStyle} >{renderItems()} </div>
    </div>
    <Indicator {...{
      barHeight: INDICATOR_BAR_HEIGHT,
      offset: getIndicatorPosition(),
      isScrolling,
    }}  />
  </div>
}