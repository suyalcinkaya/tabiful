/*global chrome*/

import React, { Component } from 'react';
import Fuse from 'fuse.js';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  width: 400px;
  max-height: 600px;
  color: rgba(0, 0, 0, 0.8);
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
`;

const Input = styled.input.attrs({
  type: "text", 
  placeholder: "Jump to..", 
  spellCheck: false, 
  autoFocus: true,
})`
  width: 100%;
  font-size: 20px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 0px;
  z-index: 0;
  padding: 16px 24px;
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  outline: 0px;
  flex: 0 0 auto;
`;

const TabList = styled.div`
  overflow-y: auto;
  padding: 12px;
  flex: 1 1 auto; 
`;

const TabContainer = styled.div`
  display: flex;
  height: 40px;
  cursor: pointer;
  -webkit-box-align: center;
  align-items: center;
  user-select: none;
  padding: 0px 6px;
  border-radius: 3px;
  -webkit-transition: 0.1s;
  transition: 0.1s;

  ${({ selected }) => selected && `
    background-color: #4ada99;
    color: #fff;
  `}

  &:hover {
    background-color: #4ada99;
    color: #fff;

    svg {
      display: block;
    }
  }
`;

const FavIcon = styled.span`
  box-sizing: content-box;
  width: 16px;
  height: 16px;
  background-color: white;
  padding: 3px;
  margin: 3px;
  border-radius: 3px;
  flex: 0 0 auto; 
`;

const favIconPlaceholder = (
  <svg viewBox="0 0 16 16" fill="none" stroke="#5A5A5A" strokeWidth="1">
    <polygon points="3.5,1.5 8.5,1.5 12.5,5.5 12.5,14.5 3.5,14.5" />
    <polyline points="8.5,1.5 8.5,5.5 12.5,5.5" />
  </svg>
);

const Title = styled.span`
  font-size: 14px;
  line-height: 40px;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin: 0px 6px;
  overflow: hidden;
  flex: 1 1 auto;
`;

const CloseIcon = styled.svg.attrs({
  viewBox :"0 0 16 16",
})`
  display: none;
  box-sizing: content-box;
  width: 16px;
  height: 16px;
  stroke: currentcolor;
  stroke-width: 1.5;
  stroke-linecap: round;
  margin: 3px;
  padding: 3px;
  border-radius: 3px;
  flex: 0 0 auto;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    -webkit-transition: 0.1s;
    transition: 0.1s;
  }
`;

const NoResult = styled.span`
  display: block;
  font-size: 14px;
  text-align: center;
  padding: 12px;
`;

class App extends Component {
  state = {
    filterValue: '',
    tabs: null,
    currentWindowId: null,
    highlightedIndex: 0,
  };

  componentDidMount() {
    setTimeout(() => {
      const promises = [
        new Promise(resolve => {
          // Remove currentWindow: true to get from all windows
          chrome.tabs.query({ currentWindow: true }, tabs => resolve(tabs));
        }),
        new Promise(resolve => {
          chrome.windows.getCurrent({}, ({ id }) => resolve(id));
        }),
      ];

      Promise.all(promises).then(([tabs, currentWindowId]) => {
        const highlightedIndex = this.getActiveIndex(tabs, currentWindowId);
        this.setState({ 
          tabs,
          currentWindowId,
          highlightedIndex,
        });
      });
    }, 250);
  }

  getActiveIndex = (tabs, currentWindowId) => {
    tabs.findIndex(tab => tab.windowId === currentWindowId && tab.active);
  }

  filterTabs = (tabs, filterValue) => {
    if ('' === filterValue || null === filterValue || undefined === filterValue) {
      return tabs;
    }

    const fuse = new Fuse(tabs, { threshold: 0.5, keys: ['title', 'url']} );
    return fuse.search(filterValue);
  };

  handleFilterChange = ({ target: { value } }) => {
    const { tabs, currentWindowId } = this.state;

    this.setState({
      filterValue: value,
      highlightedIndex: value === '' ? this.getActiveIndex(tabs, currentWindowId) : 0,
    });
  };

  handleTabSelect = tab => {
    chrome.windows.update(tab.windowId, { focused: true });
    chrome.tabs.update(tab.id, { active: true });
  };

  handleTabRemove = tab => {
    const { tabs } = this.state;

    chrome.tabs.remove(tab.id);

    this.setState({
      // remove closed tab from tabs array
      tabs: tabs.filter(({ id }) => id !== tab.id),
    });
  };

  handleKeyPress = (event) => {
    console.log(event);
  }

  render() {
    const tabs = this.filterTabs(this.state.tabs, this.state.filterValue);

    return (
      <AppContainer>
        <Input value={this.state.filterValue} onChange={this.handleFilterChange} />
        {
          tabs && (
          <TabList>
          {
            tabs.length > 0 
            ? tabs.map(tab => 
              ( 
              <TabContainer selected={tab.selected} onClick={() => {this.handleTabSelect(tab)}} onKeyPress={() => {this.handleKeyPress}}>
                <FavIcon>
                  {
                    /^https?:\/\//.test(tab.favIconUrl) 
                    ? ( <img src={tab.favIconUrl} alt="" width="100%" height="100%" /> ) 
                    : ( favIconPlaceholder )
                  }
                </FavIcon>
                <Title>{tab.title}</Title>
                <CloseIcon onClick={(event) => {
                  this.handleTabRemove(tab);
                  event.stopPropagation();
                }}>
                  <line x1="3" y1="3" x2="13" y2="13"></line>
                  <line x1="13" y1="3" x2="3" y2="13"></line>
                </CloseIcon>
              </TabContainer>
              )
            )
            : ( <NoResult>No matches found.</NoResult> )
          }
          </TabList>
          )
        }
      </AppContainer>
    );
  }
}

export default App;
