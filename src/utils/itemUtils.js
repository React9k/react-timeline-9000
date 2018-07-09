'use strict';

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
export function rowItemsRenderer(items, vis_start, vis_end, total_width, itemHeight, itemRenderer, selectedItems = []) {
  const start_end_min = vis_end.diff(vis_start, 'minutes');
  const pixels_per_min = total_width / start_end_min;
  let filtered_items = _.sortBy(
    _.filter(items, i => {
      // if end not before window && start not after window
      return !i.end.isBefore(vis_start) && !i.start.isAfter(vis_end);
    }),
    i => -i.start.unix()
  ); // sorted in reverse order as we iterate over the array backwards
  let displayItems = [];
  let rowOffset = 0;
  while (filtered_items.length > 0) {
    let lastEnd = null;
    for (let i = filtered_items.length - 1; i >= 0; i--) {
      //console.log('Last end = ' + (lastEnd !== null ? lastEnd.format() : 'Null'));
      if (lastEnd === null || filtered_items[i].start >= lastEnd) {
        //console.log('Add');
        //console.log('  > start = ' + filtered_items[i].start.format());
        //console.log('  > row = ' + rowOffset);
        let item = _.clone(filtered_items[i]);
        item.rowOffset = rowOffset;
        displayItems.push(item);
        filtered_items.splice(i, 1);
        lastEnd = item.end;
      }
    }
    rowOffset++;
  }
  //console.groupEnd('New row');
  return _.map(displayItems, i => {
    const {color} = i;
    const Comp = itemRenderer;
    let top = itemHeight * i['rowOffset'];
    let item_offset_mins = i.start.diff(vis_start, 'minutes');
    let item_duration_mins = i.end.diff(i.start, 'minutes');
    let left = Math.round(item_offset_mins * pixels_per_min);
    let width = Math.round(item_duration_mins * pixels_per_min);
    let classnames = 'rct9k-items-inner';
    let style = {backgroundColor: color};
    let isSelected = selectedItems.indexOf(Number(i.key)) > -1;

    if (isSelected) {
      classnames += ' rct9k-items-selected';
      style = {};
    }

    return (
      <span
        key={i.key}
        item-index={i.key}
        className="rct9k-items-outer item_draggable"
        style={{left, width, top, backgroundColor: 'transparent'}}>
        <Comp key={i.key} item={i} className={classnames} style={style} />
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
 * Use to find the height of a row, given a set of items
 * @param  {} items list it items
 * @returns {number} max row height
 */
export function getMaxOverlappingItems(items) {
  let max = 0;
  let sorted_items = _.sortBy(items, i => -i.start.unix());

  while (sorted_items.length > 0) {
    let lastEnd = null;
    for (let i = sorted_items.length - 1; i >= 0; i--) {
      if (lastEnd === null || sorted_items[i].start >= lastEnd) {
        lastEnd = sorted_items[i].end;
        sorted_items.splice(i, 1);
      }
    }
    max++;
  }
  return Math.max(max, 1);
}
