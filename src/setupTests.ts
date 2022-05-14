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
    ...global.navigator,
    userAgent: 'node.js'
  };
  global.console.error = (e: string) => (consoleEr += e);
  global.console.warn = (e: string) => (consoleWa += e);
}

//@ts-ignore
beforeEach(() => {
  consoleEr = '';
  consoleWa = '';
});
//@ts-ignore
afterEach(() => {
  expect(consoleEr).to.equal('');
  expect(consoleWa).to.equal('');
});
setUpDomEnvironment();
Enzyme.configure({adapter: new Adapter()});
