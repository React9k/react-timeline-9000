/**
 * Default timebar format
 */
export const timebarFormat = {
  majorLabels: {
    millisecond: {
      short: 'SSS', //001
      long: 'mm:ss.SSS' //01:10.001
    },
    second: {
      short: 'ss', //10
      long: 'HH:mm:ss' //01:10
    },
    minute: {
      short: 'mm', //01
      long: 'HH:mm' //12:01
    },
    hour: {
      short: 'HH', //13
      long: 'HH:mm' //13:00
    },
    day: {
      short: 'Do', //1st
      long: 'ddd, LL' //Sun, July 3, 2018
    },
    month: {
      short: 'MMM', //Jan
      long: 'MMMM YYYY' //January 2018
    },
    year: {
      short: 'YYYY', //2018
      long: 'YYYY' //2018
    }
  },
  minorLabels: {
    millisecond: {
      short: 'SSS', //001
      long: 'mm:ss.SSS' //01:10.001
    },
    second: {
      short: 'ss', //10
      long: 'HH:mm:ss' //01:10
    },
    minute: {
      short: 'mm', //01
      long: 'HH:mm' //12:01
    },
    hour: {
      short: 'HH', //13
      long: 'HH:mm' //13:00
    },
    day: {
      short: 'D', //1
      long: 'ddd Do' //Sun 1st
    },
    month: {
      short: 'MM', //02
      long: 'MMMM' //January
    },
    year: {
      short: 'YYYY', //2018
      long: 'YYYY' //2018
    }
  }
};
