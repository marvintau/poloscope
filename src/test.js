import React, {forwardRef} from 'react';
import List from './'

import { render, unmountComponentAtNode } from "react-dom";
import { create, act } from "react-dom/test-utils";

import MutationObserver from 'mutationobserver-polyfill';
import ResizeObserver from 'resize-observer-polyfill';

import { Simulate } from 'react-dom/test-utils';

global.MutationObserver = MutationObserver;
global.ResizeObserver = ResizeObserver;

const simulateScroll = (instance, scrollOffset) => {
  instance.scrollTop = scrollOffset;
  Simulate.scroll(instance);
};

describe('List', () => {

  let defaultProps, container = null;

  beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);

    defaultProps = {
      itemData: [],
      height: 300,
      overscan: 0,
    }

  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  })

  it('should render an empty list', () => {

    act(() => {
      render(<List {...{...defaultProps, Row:()=><div></div>}} />, container);
    })
    expect(container.querySelectorAll("[data-testid='row']").length).toBe(0);
  });

  it('should render a list of 10px height rows when no inner style given', () => {
    const rows = 10;

    const props = {
      ...defaultProps,
      Row: forwardRef(({style}, ref) => {
        return <div data-testid='row' style={style} ref={ref} />
      }),
      itemData:[...Array(rows)]
    }
    
    act(() => {
      render(<List {...props} />, container);
    })
  
    const lineStyles = [...container.querySelectorAll("[data-testid='row']")].map(({style}) => style);

    for (let [i, lineStyle] of lineStyles.entries()) {
      expect(lineStyle.height).toBe('10px');
      expect(lineStyle.top).toBe(`${i*10}px`);
    }
    
    expect(container.querySelectorAll("[data-testid='row']").length).toBe(rows);
  })

  describe('when rendering rows more than displayed in viewport', () => {

    it('should only render visible rows', () => {
  
      const rows = 60;
      const Row = forwardRef(({style}, ref) => {
        return <div style={{...style, width: '100%'}}>
          <div data-id='row' style={{height: 50}} ref={ref}>Yo</div>
        </div>
      })
  
      const props = {
        ...defaultProps,
        height: 300,
        itemData:[...Array(rows)],
        Row
      }

      act(() => {
        render(<List {...props} />, container);
      })
  
      expect(container.querySelectorAll("[data-id='row']").length).toBe(30);
    })
  })

  // it('should render a list of rows with different heights as initiated', () => {

  //   const rows = Math.floor(Math.random() * 10) + 1;
  //   const heights = [...Array(rows)].map(() => ({height: Math.floor(Math.random() * 10)}));

  //   const Row = forwardRef(({style, data}, ref) => {

  //     const {height} = data;

  //     const innerStyle = {
  //       height: `${height}px`,
  //       display: 'flex',
  //     }
  //     return <div data-testid='row' style={style} ref={ref}>
  //       <div style={innerStyle}>Example Row</div>
  //     </div>
  //   })

  //   const props = {
  //     ...defaultProps,
  //     height: 300,
  //     itemData:heights,
  //     Row
  //   }

  //   const list = <List {...props} />;

  //   act(() => {
  //     render(list, container);
  //     simulateScroll(document.getElementById('scrollView'), 10);
  //     // render(list)
  //   })

  //   expect(container.querySelectorAll("[data-testid='row']").length).toBe(rows);

  //   const lineStyles = [...container.querySelectorAll("[data-testid='row']")].map(({style}) => style);
  //   for (let [i, lineStyle] of lineStyles.entries()) {
  //     expect(lineStyle.height).toBe(`${heights[i].height < 10 ? 10 : heights[i].height}px`);
  //   }    
  // })

})
