import React from 'react';
import renderer from 'react-test-renderer';

import AppButton from '../../app/components/appbutton';

describe('<AppButton />', () => {
  it('has 1 child', () => {
    const tree = renderer.create(<AppButton />).toJSON();
    expect(tree.children.length).toBe(1);
  });
});