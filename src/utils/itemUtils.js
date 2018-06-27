import React from 'react';
import _ from 'lodash';
import moment from 'moment';

/**
 * Render all items in a row
 * @param  {object[]} items List of items to render for this row
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width pixel width of the timeline
 */
export function rowItemsRenderer(items, vis_start, vis_end, total_width, ITEM_HEIGHT) {
  const start_end_min = vis_end.diff(vis_start, 'minutes');
  const pixels_per_min = total_width / start_end_min;

  let filtered_items = _.filter(items, i => {
    // if end not before window && start not after window
    return !i.end.isBefore(vis_start) && !i.start.isAfter(vis_end);
  });
  _.forEach(filtered_items, i => {
    let offsetCount = 0;
    if (i.rowOffset === undefined) {
      i['rowOffset'] = offsetCount;
      _.forEach(filtered_items, ii => {
        if (ii.rowOffset === undefined && i.start < ii.end && i.end > ii.start) {
          ii['rowOffset'] = ++offsetCount;
        }
      });
    }
  });
  return _.map(_.sortBy(filtered_items, 'start'), i => {
    let top = ITEM_HEIGHT * i['rowOffset'];
    i['rowOffset'] = undefined;
    let item_offset_mins = i.start.diff(vis_start, 'minutes');
    let item_duration_mins = i.end.diff(i.start, 'minutes');
    let left = Math.round(item_offset_mins * pixels_per_min);
    let width = Math.round(item_duration_mins * pixels_per_min);
    const {color} = i;
    return (
      <span
        key={i.key}
        item-index={i.key}
        className="rct9k-items-outer item_draggable"
        style={{left, width, top, backgroundColor: 'transparent'}}>
        <span className="rct9k-items-inner" style={{backgroundColor: color}}>
          {i.title}
        </span>
      </span>
    );
  });
}
/**
 * Gets the row number for a given x and y pixel location
 * @param  {number} x The x coordinate of the pixel location
 * @param  {number} y The y coordinate of the pixel location
 * @returns {number} The row number
 */
export function getNearestRowHeight(x, y) {
  let elementsAtPixel = document.elementsFromPoint(x, y);
  let targetRow = _.find(elementsAtPixel, e => {
    return e.hasAttribute('row-index');
  });
  return targetRow ? targetRow.getAttribute('row-index') : 0;
}
/**
 * Get the time at a pixel location
 * @param  {number} pixel_location the pixel location (generally from left css style)
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width The pixel width of the timeline
 * @returns {moment} Moment object
 */
export function getTimeAtPixel(pixel_location, vis_start, vis_end, total_width) {
  const start_end_min = vis_end.diff(vis_start, 'minutes');
  const pixels_per_min = total_width / start_end_min;
  let min_offset = pixel_location / pixels_per_min;
  return vis_start.clone().add(min_offset, 'minutes');
}

export function getDurationFromPixels(pixels, vis_start, vis_end, total_width) {
  const start_end_min = vis_end.diff(vis_start, 'minutes');
  const pixels_per_min = total_width / start_end_min;
  let mins = pixels_per_min * pixels;
  return moment.duration(mins, 'minutes');
}
/**
 * Use to find the height of a row, given a set of items
 * @param  {} items list it items
 * @returns {number} max row height
 */
export function getMaxOverlappingItems(items) {
  let max = 1;
  _.forEach(items, i => {
    let intersects = 1;
    _.forEach(items, ii => {
      if (i.key !== ii.key) {
        if (i.start < ii.end && i.end > ii.start) intersects++;
      }
    });
    max = Math.max(max, intersects);
  });
  return max;
}
