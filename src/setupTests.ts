import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

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
  expect(consoleEr).toEqual('');
  expect(consoleWa).toEqual('');
});
setUpDomEnvironment();
Enzyme.configure({adapter: new Adapter()});
