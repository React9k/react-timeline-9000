'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import DemoTimeline from 'demo';
import {TestsAreDemoAppWrapper} from '@famiprog-foundation/tests-are-demo';
import {tad} from '@famiprog-foundation/tests-are-demo';
import {ExpTestsAreDemo} from './testsAreDemo/ExpTestsAreDemo';

ReactDOM.render(
  <TestsAreDemoAppWrapper
    importSemanticUiCss
    app={<DemoTimeline />}
    importTestsCallback={() => {
      tad.addTests(ExpTestsAreDemo);
    }}
  />,
  document.getElementById('root')
);
