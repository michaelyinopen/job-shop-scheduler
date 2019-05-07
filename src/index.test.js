import React from 'react';
import MyComponent from './index';
import renderer from 'react-test-renderer';

test('Can render demo timeline', () => {
  const component = renderer.create(
    <MyComponent />
  );
});


test('Matches snapshot', () => {
  const component = renderer.create(
    <MyComponent />
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});