import React from "react"
import {create} from "react-test-renderer";
import loginScreen from "../../app/screens"

const tree = create(<loginScreen />);

test("snapshot", () => {
    expect(tree).toMatchSnapshot();
});