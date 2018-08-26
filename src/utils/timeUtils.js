// Time utilities

import moment from 'moment';

/**
 * Snaps a moment object to the given resolution
 * @param {moment} time The moment to snap
 * @param {number} snapSeconds The snap time in seconds
 * @returns {moment} Snapped moment
 */
export function timeSnap(time, snapSeconds) {
  if (snapSeconds === 0) {
    const newTime = time.clone();
    newTime.set('millisecond', 0);
    return newTime;
  }
  const newUnix = Math.round(time.unix() / snapSeconds) * snapSeconds;
  return moment(newUnix * 1000);
}

/**
 * Get the pixels per minute
 * @param {moment} vis_start The moment specifying the start of the visible timeline range
 * @param {moment} vis_end The moment specifying the end of the visible timeline range
 * @param {number} total_width The width of the timeline in pixels
 * @returns {float} The pixels per minute
 */
export function pixelsPerMinute(vis_start, vis_end, total_width) {
  const start_end_min = vis_end.diff(vis_start, 'minutes');
  return total_width / start_end_min;
}

/**
 *
 * @param {number} delta the delta distance in pixels
 * @param {moment} vis_start the visible start of the timeline
 * @param {moment} vis_end  the visible end of the timeline
 * @param {number} total_width  the pixel width of the timeline
 * @param {number} snapMinutes the number of minutes to snap to
 */
export function getSnapPixelFromDelta(delta, vis_start, vis_end, total_width, snapMinutes = 0) {
  const pixelsPerSnapSegment = pixelsPerMinute(vis_start, vis_end, total_width) * snapMinutes;
  return Math.round(delta / pixelsPerSnapSegment) * pixelsPerSnapSegment;
}

/**
 * Get the time at a pixel location
 * @param  {number} pixel_location the pixel location (generally from left css style)
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width The pixel width of the timeline (row portion)
 * @returns {moment} Moment object
 */
export function getTimeAtPixel(pixel_location, vis_start, vis_end, total_width, snapMinutes = 0) {
  let min_offset = pixel_location / pixelsPerMinute(vis_start, vis_end, total_width);
  let timeAtPix = vis_start.clone().add(min_offset, 'minutes');
  if (snapMinutes !== 0) timeAtPix = timeSnap(timeAtPix, snapMinutes * 60);
  return timeAtPix;
}
/**
 * Get the pixel location at a specific time
 * @param  {objects} time The time (moment) object
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width The width in pixels of the grid
 * @returns {number} The pixel offset
 */
export function getPixelAtTime(time, vis_start, vis_end, total_width) {
  const min_from_start = time.diff(vis_start, 'minutes');
  return min_from_start * pixelsPerMinute(vis_start, vis_end, total_width);
}
/**
 * Returns the duration from the {@link vis_start}
 * @param  {number} pixels
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width The width in pixels of the grid
 * @returns {moment} Moment duration
 */
export function getDurationFromPixels(pixels, vis_start, vis_end, total_width) {
  const start_end_min = vis_end.diff(vis_start, 'minutes');
  if (start_end_min === 0) return moment.duration(0, 'minutes');
  const pixels_per_min = total_width / start_end_min;
  let mins = pixels / pixels_per_min;
  return moment.duration(mins, 'minutes');
}
