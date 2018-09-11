import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

const defaultProps = {
  placeholder: '',
  value: '',
  onChange: () => {},
};

const InputItem = styled.input.attrs({
  type: "text",
  spellcheck: "false",
  autoFocus: "true",
})`
  width: 100%;
  font-size: 16px;
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

  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
`;

function Input({ placeholder, value, onChange }) {
  return (
    <InputItem
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

Input.propTypes = propTypes;
Input.defaultProps = defaultProps;

export default Input;
