import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const propTypes = {
  tab: PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    favIconUrl: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  onMouseEnter: PropTypes.func,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
};

const defaultProps = {
  isActive: false,
  isHighlighted: false,
  onMouseEnter: () => { },
  onClick: () => { },
  onRemove: () => { },
};

const TabContainer = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 6px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;

  ${({ isActive }) => isActive && `
    color: #4ada99;
  `}

  ${({ isHighlighted }) => isHighlighted && `
    color: #fff;
    background-color: #4ada99;
  `}
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
  viewBox: '0 0 16 16',
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

  ${({ isHighlighted }) => isHighlighted && `
    display: block;
  `}
`;

function Tab({ tab, isHighlighted, onRemove, ...props }) {
  console.log('tab index: ' + tab.index + ', isHighlighted: ' + isHighlighted);
  return (
    <TabContainer isHighlighted={isHighlighted} {...props}>
      <FavIcon>
        {/^https?:\/\//.test(tab.favIconUrl) ? (
          <img src={tab.favIconUrl} alt="" width="100%" height="100%" />
        ) : (
            favIconPlaceholder
          )}
      </FavIcon>
      <Title>{tab.title}</Title>
      <CloseIcon
        isHighlighted={isHighlighted}
        onClick={event => {
          onRemove();
          event.stopPropagation();
        }}
      >
        <line x1="3" y1="3" x2="13" y2="13" />
        <line x1="13" y1="3" x2="3" y2="13" />
      </CloseIcon>
    </TabContainer>
  );
}

Tab.propTypes = propTypes;
Tab.defaultProps = defaultProps;

export default Tab;
