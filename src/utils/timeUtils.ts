// Time utilities

import moment from 'moment';

type MomentType = moment.Moment;
type MomentDurationType = moment.Duration;

/**
 * Snaps a moment object to the given resolution
 * @param {moment} time The moment to snap
 * @param {number} snapMilliseconds The snap time in milliseconds
 * @returns {moment} Snapped moment
 */
export function timeSnap(time: MomentType, snapMilliseconds: number): MomentType {
  if (snapMilliseconds === 0) {
    const newTime = time.clone();
    newTime.set('millisecond', 0);
    return newTime;
  }
  const newUnix = Math.round((time.unix() * 1000) / snapMilliseconds) * snapMilliseconds;
  return moment(newUnix);
}

/**
 * Get the pixels per millisecond
 * @param {moment} vis_start The moment specifying the start of the visible timeline range
 * @param {moment} vis_end The moment specifying the end of the visible timeline range
 * @param {number} total_width The width of the timeline in pixels
 * @returns {float} The pixels per millisecond
 */
export function pixelsPerMillisecond(vis_start: MomentType, vis_end: MomentType, total_width: number): number {
  const start_end_ms = vis_end.diff(vis_start, 'milliseconds');
  return total_width / start_end_ms;
}

/**
 *
 * @param {number} delta the delta distance in pixels
 * @param {moment} vis_start the visible start of the timeline
 * @param {moment} vis_end  the visible end of the timeline
 * @param {number} total_width  the pixel width of the timeline
 * @param {number} snapMilliseconds the number of milliseconds to snap to
 */
export function getSnapPixelFromDelta(
  delta: number,
  vis_start: MomentType,
  vis_end: MomentType,
  total_width: number,
  snapMilliseconds: number = 0
): number {
  const pixelsPerSnapSegment = pixelsPerMillisecond(vis_start, vis_end, total_width) * snapMilliseconds;
  return Math.round(delta / pixelsPerSnapSegment) * pixelsPerSnapSegment;
}

/**
 * Get the time at a pixel location
 * @param {number} pixel_location the pixel location (generally from left css style)
 * @param {moment} vis_start The visible start of the timeline
 * @param {moment} vis_end The visible end of the timeline
 * @param {number} total_width The pixel width of the timeline (row portion)
 * @param {number} snapMilliseconds The snap resolution (in ms)
 * @returns {moment} Moment object
 */
export function getTimeAtPixel(
  pixel_location: number,
  vis_start: MomentType,
  vis_end: MomentType,
  total_width: number,
  snapMilliseconds = 0
) {
  let min_offset = pixel_location / pixelsPerMillisecond(vis_start, vis_end, total_width);
  let timeAtPix = vis_start.clone().add(min_offset, 'milliseconds');
  if (snapMilliseconds !== 0) timeAtPix = timeSnap(timeAtPix, snapMilliseconds);
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
export function getPixelAtTime(
  time: MomentType,
  vis_start: MomentType,
  vis_end: MomentType,
  total_width: number
): number {
  const min_from_start = time.diff(vis_start, 'milliseconds');
  return min_from_start * pixelsPerMillisecond(vis_start, vis_end, total_width);
}
/**
 * Returns the duration from the {@link vis_start}
 * @param  {number} pixels
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width The width in pixels of the grid
 * @returns {moment} Moment duration
 */
export function getDurationFromPixels(
  pixels: number,
  vis_start: MomentType,
  vis_end: MomentType,
  total_width: number
): MomentDurationType {
  const start_end_ms = vis_end.diff(vis_start, 'milliseconds');
  if (start_end_ms === 0) return moment.duration(0, 'milliseconds');
  const pixels_per_ms = total_width / start_end_ms;
  let millis = pixels / pixels_per_ms;
  return moment.duration(millis, 'milliseconds');
}

/**
 * If useMoment is true returns the date, otherwise converts date to moment.
 * @param {moment|number} date
 * @param {boolean} useMoment
 * @returns moment
 */
export function convertDateToMoment(date: MomentType | number, useMoment: boolean) {
  if (useMoment) {
    return date;
  }
  return moment(date);
}

/**
 * If useMoment is true returns dateAsMoment, otherwise it converts dateAsMoment to milliseconds.
 * @param {moment} dateAsMoment moment to be converted
 * @param {boolean} useMoment if true return dateAsMoment, otherwise return millis
 * @returns a moment object or date in milliseconds
 */
export function convertMomentToDateType(dateAsMoment: MomentType, useMoment: boolean) {
  if (useMoment) {
    return dateAsMoment;
  }
  return dateAsMoment.valueOf();
}
