import React from 'react';
import moment from 'moment';

import DemoTimeline from '../demo';
import Timeline from '../timeline';

export default {
  title: 'Timeline'
};

export const OriginalDemo = () => <DemoTimeline />;

const humanResources = [
  {id: 0, title: 'John Doe'},
  {id: 1, title: 'Alex Randal'},
  {id: 2, title: 'Mary Danton'}
];
const tasks = [
  {row: 0, title: 'T1', color: 'red', start: moment('2018-09-20 8:00'), end: moment('2018-09-20 9:00')},
  {row: 0, title: 'T2', color: 'red', start: moment('2018-09-20 18:00'), end: moment('2018-09-20 19:00')},
  {row: 0, title: 'T3', color: 'red', start: moment('2018-09-20 20:00'), end: moment('2018-09-20 21:00')},
  {row: 1, title: 'T1', color: 'yellow', start: moment('2018-09-20 7:00'), end: moment('2018-09-20 8:00')},
  {row: 1, title: 'T2', color: 'yellow', start: moment('2018-09-20 17:00'), end: moment('2018-09-20 20:00')},
  {row: 1, title: 'T3', color: 'yellow', start: moment('2018-09-20 19:00'), end: moment('2018-09-20 20:00')},
  {row: 2, title: 'T1', color: 'blue', start: moment('2018-09-20 8:00'), end: moment('2018-09-20 10:00')},
  {row: 2, title: 'T2', color: 'blue', start: moment('2018-09-20 18:00'), end: moment('2018-09-20 20:00')},
  {row: 2, title: 'T3', color: 'blue', start: moment('2018-09-20 20:00'), end: moment('2018-09-20 21:00')}
];

export const SomeTasks = () => (
  <div className="demo">
    <Timeline
      shallowUpdateCheck
      items={tasks}
      groups={humanResources}
      startDate={moment('2018-09-20')}
      endDate={moment('2018-09-21')}
    />
  </div>
);
