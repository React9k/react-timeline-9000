import moment from 'moment';
import { Group, Item } from '../index';

// utility function used for hardcoding our sample data
export const d = (str: moment.MomentInput) => moment(str).valueOf();

export const someHumanResources: Group[] = [
  {id: 0, title: 'John Doe'},
  {id: 1, title: 'Alex Randal'},
  {id: 2, title: 'Mary Danton'},
  {id: 3, title: 'Kim Price'}
];

// 10 rows, so it's easy to remember in stories: new tasks start from 11
export const someTasks: Item[] = [
  {key: 0, row: 0, title: 'Task JD1', start: d('2018-09-20 8:00'), end: d('2018-09-20 11:00')},
  {key: 1, row: 0, title: 'Task JD2', start: d('2018-09-20 18:00'), end: d('2018-09-20 19:00')},
  {key: 2, row: 0, title: 'Task JD3', start: d('2018-09-20 20:00'), end: d('2018-09-20 21:00')},
  {key: 3, row: 1, title: 'Task AR1', start: d('2018-09-20 7:00'), end: d('2018-09-20 11:30')},
  {key: 4, row: 1, title: 'Task AR2', start: d('2018-09-20 17:00'), end: d('2018-09-20 20:00')},
  {key: 5, row: 1, title: 'Task AR3', start: d('2018-09-20 19:00'), end: d('2018-09-20 20:00')},
  {key: 6, row: 2, title: 'Task MD2', start: d('2018-09-20 8:00'), end: d('2018-09-20 10:00')},
  {key: 7, row: 2, title: 'Task MD4', start: d('2018-09-20 18:00'), end: d('2018-09-20 20:00')},
  {key: 8, row: 2, title: 'Task MD5', start: d('2018-09-20 20:00'), end: d('2018-09-20 21:00')},
  {key: 9, row: 2, title: 'Task MD2', start: d('2018-09-20 5:00'), end: d('2018-09-20 7:00')},
  {key: 10, row: 2, title: 'Task MD3', start: d('2018-09-20 13:00'), end: d('2018-09-20 14:00')}
];
