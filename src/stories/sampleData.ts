import moment from 'moment';
import { Group, Item } from '../types';

////////////////////////////////////////////////////////
// utility functions used for hardcoding our sample data
////////////////////////////////////////////////////////
export const d = (str: moment.MomentInput) => moment(str).valueOf();

export const endOfCurrentMonth = () => d(moment().endOf('month'));

export const startOfCurrentMonth = () => d(moment().startOf('month'));

export const dateAndHourOfCurrentMonth = (day, hour = 0) => d(moment().startOf('month').add('days', day-1).add('hours', hour));

////////////////////////////////////////////////////////
// sample data
////////////////////////////////////////////////////////
export type Employee = Group & {
  job?: string,
  team?: string
} 

export const someHumanResources: Employee[] = [
  {id: 0, title: 'John Doe', job: 'HR manager', team: 'Team 1'},
  {id: 1, title: 'Alex Randal', job: 'Recruiter', team: 'Team 2'},
  {id: 2, title: 'Mary Danton', job: 'Developer', team: 'Team 3'},
  {id: 3, title: 'Kim Price', job: 'Developer', team: 'Team 3'}
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

export const manyHumanResources: Employee[] = [...someHumanResources, { id: 4, title: 'George Walsh', job: 'Developer' }, 
{ id: 5, title: 'Mary McDonald', job: 'Developer' },
{ id: 6, title: 'Mary A. McDonald', job: 'Developer'},
{ id: 7, title: 'John Rider', job: 'Developer'},
{ id: 8, title: 'Tom Smith', job: 'Developer'},
{ id: 9, title: 'David Johnson', job: 'Developer'},
{ id: 10, title: 'James Johnson', job: 'Developer'},
{ id: 11, title: 'Maria Garcia', job: 'Developer'},
{ id: 12, title: 'Michael Smith', job: 'Developer'},
{ id: 13, title: 'David Brown', job: 'Developer'},
{ id: 14, title: 'Mary B. McDonald', job: 'Developer'},
{ id: 15, title: 'John B. Rider', job: 'Developer'},
{ id: 16, title: 'Tom B. Smith', job: 'Developer'},
{ id: 17, title: 'David B. Johnson', job: 'Developer'},
{ id: 18, title: 'James B. Johnson', job: 'Developer'},
{ id: 19, title: 'Maria B. Garcia', job: 'Developer'},
{ id: 20, title: 'Michael B. Smith', job: 'Developer'},
{ id: 21, title: 'David B. Brown', job: 'Developer'},
{ id: 22, title: 'Michael C. Smith', job: 'Developer'},
{ id: 23, title: 'David C. Brown', job: 'Developer'},
{ id: 24, title: 'Michael D. Smith', job: 'Developer'},
{ id: 25, title: 'David D. Brown', job: 'Developer'},
{ id: 26, title: 'Michael E. Smith', job: 'Developer'},
{ id: 27, title: 'David E. Brown', job: 'Developer'}];