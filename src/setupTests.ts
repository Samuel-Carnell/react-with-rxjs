// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// React 18 will spam console errors if the react dom render is used. Which
// react testing-library/react-hooks still uses. The prevents these errors from
// being spammed in the code by overriding the console error function to not do anything
// eslint-disable-next-line
console.error = () => {};
