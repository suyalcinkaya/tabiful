/*global chrome*/

import React, { Component } from 'react';
import Fuse from 'fuse.js';
import './App.css';

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
          chrome.tabs.query({}, tabs => resolve(tabs));
        }),
        new Promise(resolve => {
          chrome.windows.getCurrent({}, ({ id }) => resolve(id));
        }),
      ];

      Promise.all(promises).then(([tabs, currentWindowId]) => {
        const highlightedIndex = this.getActiveIndex(tabs, currentWindowId);

        this.setState({
          tabs: tabs,
          currentWindowId: currentWindowId,
          highlightedIndex: highlightedIndex,
        });
      });
    }, 200);
  }

  getActiveIndex = (tabs, currentWindowId) => {
    tabs.findIndex(tab => tab.windowId === currentWindowId && tab.active);
  }

  filterTabs = (tabs, filterValue) => {
    if ('' === filterValue || null === filterValue || undefined === filterValue) {
      return tabs;
    }

    const options = {
      threshold: 0.5,
      keys: ['title', 'url'],
    };

    const fuse = new Fuse(tabs, options);

    return fuse.search(filterValue);
  };

  getActiveIndex = (tabs, currentWindowId) => {
    tabs.findIndex(tab => tab.windowId === currentWindowId && tab.active);
  }

  handleFilterChange = ({ target: { value } }) => {
    const { tabs, currentWindowId } = this.state;

    this.setState({
      filterValue: value,
      highlightedIndex: value === '' ? this.getActiveIndex(tabs, currentWindowId) : 0,
    });
  };

  handleTabSelect = tab => {
    chrome.windows.update(tab.windowId, { focused: true }, () => {
      chrome.tabs.update(tab.id, { active: true });
      chrome.tabs.update(tab.id, { highlighted: true });
      chrome.tabs.update(tab.id, { selected: true });
    });
  };

  handleTabRemove = tab => {
    const { tabs } = this.state;

    chrome.tabs.remove(tab.id);

    this.setState({
      // remove closed tab from tabs array
      tabs: tabs.filter(({ id }) => id !== tab.id),
    });
  };

  render() {
    const tabs = this.filterTabs(this.state.tabs, this.state.filterValue);
    console.log(tabs);

    return (
      <div className="app-container">
        <input type="text" placeholder="Jump to.." autoFocus value={this.state.filterValue} onChange={this.handleFilterChange} />
        <div className="tabs-wrapper">
          {
            tabs && tabs.map(tab => 
              <div className="tabs-item" onClick={() => {this.handleTabSelect(tab)}}>
                <span className="favIcon-wrapper">
                  <img src={tab.favIconUrl} alt width="100%" height="100%" />
                </span>
                <span className="tab-title">{tab.title}</span>
                <svg viewBox="0 0 16 16" onClick={() => {this.handleTabRemove(tab)}}>
                  <line x1="3" y1="3" x2="13" y2="13"></line>
                  <line x1="13" y1="3" x2="3" y2="13"></line>
                </svg>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default App;
