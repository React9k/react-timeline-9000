import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {expect} from 'chai';

import jsdom from 'jsdom';

let consoleEr = '';
let consoleWa = '';

function setUpDomEnvironment() {
  const {JSDOM} = jsdom;
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'http://localhost/'});
  const {window} = dom;

  global.window = window;
  global.document = window.document;
  global.navigator = {
    userAgent: 'node.js'
  };
  global.console.error = e => (consoleEr += e);
  global.console.warn = e => (consoleWa += e);
  global.console.warning = e => (consoleWa += e);
  copyProps(window, global);
}

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .map(prop => Object.getOwnPropertyDescriptor(src, prop));
  Object.defineProperties(target, props);
}

beforeEach(function() {
  consoleEr = '';
  consoleWa = '';
});
afterEach(function() {
  expect(consoleEr).to.equal('');
  expect(consoleWa).to.equal('');
});
setUpDomEnvironment();
Enzyme.configure({adapter: new Adapter()});
