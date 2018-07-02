// Time utilities

import moment from 'moment';

/**
 * @param  {} time The moment to snap
 * @param  {} snapSeconds The snap time in seconds
 * @returns {} Snapped time
 */
export function timeSnap(time, snapSeconds) {
  const newUnix = Math.round(time.unix() / snapSeconds) * snapSeconds;
  return moment(newUnix * 1000);
}
