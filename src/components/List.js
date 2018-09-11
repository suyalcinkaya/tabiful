import React from 'react';
import Mousetrap from 'mousetrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ListContainer = styled.div`
  overflow-y: auto;
  padding: 12px;
  flex: 1 1 auto; 
`;

class List extends React.PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.any),
    highlightedIndex: PropTypes.number,
    renderItem: PropTypes.func.isRequired,
    renderEmpty: PropTypes.func,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    onRemove: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    highlightedIndex: 0,
    renderEmpty: () => { },
    onChange: () => { },
    onSelect: () => { },
    onRemove: () => { },
  };

  state = {
    isMouseEnterPrevented: false,
  };

  componentDidMount() {
    const highlightedNode = this.containerElement.children[
      this.props.highlightedIndex
    ];

    this.scrollToItem(highlightedNode, this.containerElement);

    // set up key handlers
    Mousetrap.prototype.stopCallback = () => false;

    Object.keys(this.keyHandlers).forEach(key => {
      Mousetrap.bind(key, this.keyHandlers[key]);
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.highlightedIndex === this.props.highlightedIndex) return;

    if (this.containerElement.children.length > 0) {
      const highlightedNode = this.containerElement.children[
        this.props.highlightedIndex
      ];

      this.scrollToItem(highlightedNode, this.containerElement);
    }
  }

  componentWillUnmount() {
    Mousetrap.reset();
  }

  getItemEventHandlers = (item, index) => ({
    onMouseEnter: () => {
      if (!this.state.isMouseEnterPrevented) {
        this.changeHighlightedIndex(index);
      }
    },
    onClick: () => this.selectItem(item),
    onRemove: () => this.removeItem(item, index),
  });

  setContainerRef = node => {
    this.containerElement = node;
  };

  scrollToItem = (itemElement, containerElement) => {
    const containerStyle = getComputedStyle(containerElement);
    const containerPaddingTop = parseInt(
      containerStyle.getPropertyValue('padding-top'),
      10,
    );
    const containerPaddingBottom = parseInt(
      containerStyle.getPropertyValue('padding-bottom'),
      10,
    );

    const containerRect = containerElement.getBoundingClientRect();
    const itemRect = itemElement.getBoundingClientRect();

    if (itemRect.top < containerRect.top + containerPaddingTop) {
      // eslint-disable-next-line no-param-reassign
      containerElement.scrollTop += itemRect.top - (containerRect.top + containerPaddingTop);

      this.setState({ isMouseEnterPrevented: true });
    }

    if (itemRect.bottom > containerRect.bottom - containerPaddingBottom) {
      // eslint-disable-next-line no-param-reassign
      containerElement.scrollTop += itemRect.bottom - (containerRect.bottom - containerPaddingBottom);

      this.setState({ isMouseEnterPrevented: true });
    }
  };

  changeHighlightedIndex = highlightedIndex => {
    this.props.onChange(highlightedIndex);
  };

  moveHighlightedIndex = amount => {
    if (this.props.data.length === 0) return;

    let newIndex = (this.props.highlightedIndex + amount) % this.props.data.length;

    if (newIndex < 0) {
      newIndex += this.props.data.length;
    }

    this.changeHighlightedIndex(newIndex);
  };

  selectItem = item => {
    this.props.onSelect(item);
  };

  selectHighlightedItem = () => {
    if (this.props.data.length === 0) return;

    this.selectItem(this.props.data[this.props.highlightedIndex]);
  };

  removeItem = (item, index) => {
    if (index === this.props.data.length - 1) {
      this.changeHighlightedIndex(index - 1);
    }

    this.props.onRemove(item);
  };

  removeHighlightedItem = () => {
    if (this.props.data.length === 0) return;

    this.removeItem(
      this.props.data[this.props.highlightedIndex],
      this.props.highlightedIndex,
    );
  };

  keyHandlers = {
    down: event => {
      this.moveHighlightedIndex(1);
      event.preventDefault();
    },

    up: event => {
      this.moveHighlightedIndex(-1);
      event.preventDefault();
    },

    enter: event => {
      this.selectHighlightedItem();
      event.preventDefault();
    },

    'shift+backspace': event => {
      this.removeHighlightedItem();
      event.preventDefault();
    },
  };

  render() {
    console.log('Highlighted index from props: ' + this.props.highlightedIndex);
    return (
      <ListContainer innerRef={this.setContainerRef}>
        {this.props.data.length > 0 ? (
          this.props.data.map((item, index) =>
            this.props.renderItem({
              item,
              isHighlighted: index === this.props.highlightedIndex,
              itemEventHandlers: this.getItemEventHandlers(item, index),
            }),
          )
        ) : (
          this.props.renderEmpty()
        )}
      </ListContainer>
    );
  }
}

export default List;
