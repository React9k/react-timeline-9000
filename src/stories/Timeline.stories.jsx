import React from 'react';
import moment from 'moment';

import DemoTimeline from '../demo';
import Timeline from '../timeline';
import {Alert} from 'antd';

export default {
  title: 'Timeline'
};

export const OriginalDemo = () => <DemoTimeline />;

const humanResources = [
  {id: 0, title: 'John Doe'},
  {id: 1, title: 'Alex Randal'},
  {id: 2, title: 'Mary Danton'}
];
const tasksWithMoment = [
  {key: 0, row: 0, title: 'T1', color: 'red', start: moment('2018-09-20 8:00'), end: moment('2018-09-20 9:00')},
  {key: 1, row: 0, title: 'T2', color: 'red', start: moment('2018-09-20 18:00'), end: moment('2018-09-20 19:00')},
  {key: 2, row: 0, title: 'T3', color: 'red', start: moment('2018-09-20 20:00'), end: moment('2018-09-20 21:00')},
  {key: 3, row: 1, title: 'T1', color: 'yellow', start: moment('2018-09-20 7:00'), end: moment('2018-09-20 8:00')},
  {key: 4, row: 1, title: 'T2', color: 'yellow', start: moment('2018-09-20 17:00'), end: moment('2018-09-20 20:00')},
  {key: 5, row: 1, title: 'T3', color: 'yellow', start: moment('2018-09-20 19:00'), end: moment('2018-09-20 20:00')},
  {key: 6, row: 2, title: 'T1', color: 'blue', start: moment('2018-09-20 8:00'), end: moment('2018-09-20 10:00')},
  {key: 7, row: 2, title: 'T2', color: 'blue', start: moment('2018-09-20 18:00'), end: moment('2018-09-20 20:00')},
  {key: 8, row: 2, title: 'T3', color: 'blue', start: moment('2018-09-20 20:00'), end: moment('2018-09-20 21:00')}
];

// we convert start and end from the moment object to a raw timestamp (millis)
// reminder: moment.valueOf() returns a raw timestamp (a number of millis)
const tasksWithoutMoment = tasksWithMoment.map(t => {
  return {...t, start: t.start.valueOf(), end: t.end.valueOf()};
});

export const BasicUsageWithoutMoment = () => (
  <div className="demo">
    <Alert
      message={
        <React.Fragment>
          <p>
            The Timeline was originally designed to handle date/times w/ <a href="https://momentjs.com/">Moment.js</a>,
            a popular lib. However there are 2 drawbacks. <b>#1</b>: even the authors/maintainers of Moment.js don't
            quite <a href="https://momentjs.com/docs/">recommend</a> it any more for use with new projects. The major
            complain seems to be the mutability of "moment" objects. <b>#2</b>: "moment" objects are not friendly with{' '}
            <a href="https://redux.js.org/">Redux</a>, a popular framework for state management. Many folk use React for
            state management. And not being able to store the state that feeds the Timeline is a big drawback, since
            additional conversions are necessary.
          </p>
          <p>
            The{' '}
            <b>
              property <code>useMoment</code>
            </b>{' '}
            to the rescue! If <code>false</code>, then you when you "talk" date/times to the Timeline, then you use
            plain timestamps (i.e. number of millis, e.g. <code>new Date().valueOf()</code>). And this everywhere where
            a date/time is needed (e.g. for an item, for global start/end, etc.). This is the <b>recommended</b> way to
            go, especially if you use Redux. But be aware that this property is by default <code>true</code>, in order
            to maintain backward compatibility.
          </p>
          <p>
            NOTE: the Timeline still uses "moment" internally. And this because it was quicker to refactor this way.
            This may change in the future, if we find reasons and time to refactor more.
          </p>
        </React.Fragment>
      }
    />
    <Timeline
      shallowUpdateCheck
      useMoment={false}
      items={tasksWithoutMoment}
      groups={humanResources}
      startDate={moment('2018-09-20').valueOf()}
      endDate={moment('2018-09-21').valueOf()}
    />
  </div>
);

export const BasicUsageWithMoment = () => (
  <div className="demo">
    <Timeline
      shallowUpdateCheck
      items={tasksWithMoment}
      groups={humanResources}
      startDate={moment('2018-09-20')}
      endDate={moment('2018-09-21')}
    />
  </div>
);
