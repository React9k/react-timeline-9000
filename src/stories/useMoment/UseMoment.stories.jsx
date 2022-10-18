import React from 'react';
import moment from 'moment';
import Timeline from '../../timeline';

const TIMELINE_EVENTS = [
  'onInteraction',
  'onItemClick',
  'onItemDoubleClick',
  'onItemContext',
  'onRowClick',
  'onRowContext',
  'onRowDoubleClick',
  'onItemHover',
  'onItemLeave'
];

/**
 * We want to hide the events from "Controls" tab.
 * However, if the events are not included in Controls they will not be shown in Actions.
 * Solution: include the event in controls, but disable it in argTypes.
 */
let argTypes = {};
TIMELINE_EVENTS.forEach(timelineEvent => {
  argTypes[timelineEvent] = {
    table: {
      disable: true
    }
  };
});

export default {
  title: 'Internal/Use moment',
  component: Timeline,
  parameters: {
    previewTabs: {
      'storybook/docs/panel': {hidden: true}
    },
    viewMode: 'story',
    controls: {
      disable: true,
      include: ['startDate', 'endDate', ...TIMELINE_EVENTS]
    },
    actions: {
      disable: true
    }
  },
  argTypes
};

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

const TimelineWithMomentTemplate = args => {
  const {startDate, endDate, ...events} = args;
  return (
    <Timeline
      shallowUpdateCheck
      useMoment={true}
      startDate={moment(startDate)}
      endDate={moment(endDate)}
      items={tasksWithMoment}
      groups={humanResources}
      {...events}
    />
  );
};

export const Main = TimelineWithMomentTemplate.bind({});
Main.args = {
  startDate: '2018-09-20',
  endDate: '2018-09-21'
};
Main.parameters = {
  controls: {
    disable: false
  },
  actions: {
    disable: false
  }
};

const TimelineWithoutMomentTemplate = args => {
  const {startDateInMillis, endDateInMillis, ...events} = args;
  return (
    <Timeline
      shallowUpdateCheck
      useMoment={false}
      items={tasksWithoutMoment}
      groups={humanResources}
      startDate={startDateInMillis}
      endDate={endDateInMillis}
      {...events}
    />
  );
};

export const WithoutMoment = TimelineWithoutMomentTemplate.bind({});
WithoutMoment.args = {
  startDate: moment('2018-09-20').valueOf(),
  endDate: moment('2018-09-21').valueOf()
};
