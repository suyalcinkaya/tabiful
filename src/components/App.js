/*global chrome*/

import React, { Component } from 'react';
import Fuse from 'fuse.js';
import styled from 'styled-components';

import Input from './Input';
import List from './List';
import Tab from './Tab';

const AppContainer = styled.div`
  display: flex;
  width: 400px;
  max-height: 600px;
  color: rgba(0, 0, 0, 0.8);
  flex-direction: column;
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
        console.log('Highlighted index: ' + highlightedIndex);
        this.setState({ 
          tabs,
          currentWindowId,
          highlightedIndex,
        });
      });
    }, 250);
  }

  getActiveIndex = (tabs, currentWindowId) => tabs.findIndex(tab => tab.windowId === currentWindowId && tab.active);
  

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

  handleHighlightChange = highlightedIndex => {
    this.setState({ highlightedIndex });
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

  handleKeyPress = event => {
    console.log(event);
  }

  render() {
    const tabs = this.filterTabs(this.state.tabs, this.state.filterValue);
    console.log(tabs);
    console.log('Highligted index from app.js: ' + this.state.highlightedIndex);

    return (
      <AppContainer>
        <Input placeholder="Jump to..." value={this.state.filterValue} onChange={this.handleFilterChange} />
        {
          tabs && (
            <List
              data={tabs}
              highlightedIndex={this.state.highlightedIndex}
              onChange={this.handleHighlightChange}
              onSelect={this.handleTabSelect}
              onRemove={this.handleTabRemove}
              renderItem={({ item, isHighlighted, itemEventHandlers }) => (
                <Tab
                  key={item.id}
                  tab={item}
                  isHighlighted={isHighlighted}
                  isActive={
                    item.windowId === this.state.currentWindowId && item.active
                  }
                  {...itemEventHandlers}
                />
              )}
              renderEmpty={() => (
                <NoResult>No matches found.</NoResult>
              )}
            />
          )}
      </AppContainer>
    );
  }
}

export default App;
