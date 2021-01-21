'use strict';

import React from 'react';
import _ from 'lodash';
import moment from 'moment';

/**
 * Render all items in a row
 * @external {moment} http://momentjs.com/
 * @param  {Object[]} items List of items to render for this row
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width pixel width of the timeline
 */
export function rowItemsRenderer(items, vis_start, vis_end, total_width, itemHeight, itemRenderer, onMouseOver, onMouseLeave, onItemLeaveselectedItems = []) {
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
      if (lastEnd === null || filtered_items[i].start >= lastEnd) {
        let item = _.clone(filtered_items[i]);
        item.rowOffset = rowOffset;
        displayItems.push(item);
        filtered_items.splice(i, 1);
        lastEnd = item.end;
      }
    }
    rowOffset++;
  }
  return _.map(displayItems, i => {
    const {color} = i;
    const Comp = itemRenderer;
    let top = itemHeight * i['rowOffset'];
    let item_offset_mins = i.start.diff(vis_start, 'minutes');
    let item_duration_mins = i.end.diff(i.start, 'minutes');
    let left = Math.round(item_offset_mins * pixels_per_min);
    let width = Math.round(item_duration_mins * pixels_per_min);
    let compClassnames = 'rct9k-items-inner';
    let outerClassnames = 'rct9k-items-outer item_draggable';
    let style = {backgroundColor: color};
    let isSelected = selectedItems.indexOf(Number(i.key)) > -1;

    if (isSelected) {
      compClassnames += ' rct9k-items-selected';
      outerClassnames += ' rct9k-items-outer-selected';
      style = {};
    }

    return (
      <span
        key={i.key}
        data-item-index={i.key}
        className={outerClassnames}
        style={{left, width, top, backgroundColor: 'transparent'}}
        onMouseOver={onMouseOver}
        onMouseOver={onMouseLeave}
      >
        <Comp key={i.key} item={i} className={compClassnames} style={style} />
      </span>
    );
  });
}

/**
 * Render row layers
 * @param  {Object[]} layers List of layers to render for this row
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width pixel width of the timeline
 * @param  {number} itemHeight The layer height in px
 */
export function rowLayerRenderer(layers, vis_start, vis_end, total_width, itemHeight) {
  const start_end_min = vis_end.diff(vis_start, 'minutes');
  const pixels_per_min = total_width / start_end_min;
  let filtered_items = _.sortBy(
    _.filter(layers, i => {
      return !i.end.isBefore(vis_start) && !i.start.isAfter(vis_end);
    }),
    i => -i.start.unix()
  ); // sorted in reverse order as we iterate over the array backwards
  let displayItems = [];
  let rowOffset = 0;
  while (filtered_items.length > 0) {
    let lastEnd = null;
    for (let i = filtered_items.length - 1; i >= 0; i--) {
      if (lastEnd === null || filtered_items[i].start >= lastEnd) {
        let item = _.clone(filtered_items[i]);
        item.rowOffset = rowOffset;
        displayItems.push(item);
        filtered_items.splice(i, 1);
        lastEnd = item.end;
      }
    }
    rowOffset++;
  }
  return _.map(displayItems, i => {
    const {style, rowNumber} = i;
    let top = itemHeight * i['rowOffset'];
    let item_offset_mins = i.start.diff(vis_start, 'minutes');
    let item_duration_mins = i.end.diff(i.start, 'minutes');
    let left = Math.round(item_offset_mins * pixels_per_min);
    let width = Math.round(item_duration_mins * pixels_per_min);
    let height = itemHeight - (rowNumber === 0 ? 2 : 1); // for border
    let outerClassnames = 'rct9k-row-layer';

    return (
      <div
        key={`r-${rowNumber}-${i.start.unix()}`}
        data-item-index={i.key}
        className={outerClassnames}
        style={{...style, left, width, top, height}}
      />
    );
  });
}

/**
 * Gets the row object for a given x and y pixel location
 * @param  {number} x The x coordinate of the pixel location
 * @param  {number} y The y coordinate of the pixel location
 * @param  {Object} topDiv Div to search under
 * @returns {Object} The row object at that coordinate
 */
export function getNearestRowObject(x, y, topDiv = document) {
  let elementsAtPixel = document.elementsFromPoint(x, y);
  return _.find(elementsAtPixel, e => {
    const inDiv = topDiv.contains(e);
    return inDiv && e.hasAttribute('data-row-index');
  });
}

/**
 * Gets the row number for a given row object
 * @param  {Object} elem The row object
 * @returns {number} The row number
 */
export function getRowObjectRowNumber(elem) {
  return Number(elem ? elem.getAttribute('data-row-index') : 0);
}

/**
 * Gets the vertical margins and borders given an object
 * @param  {Object} elem The row object
 * @returns {number} the pixel position of the bottom of the element
 */
export function getVerticalMarginBorder(elem) {
  const computedStyles = window.getComputedStyle(elem);
  // top margin plus bottom margin halved
  const rowMargins =
    (Math.ceil(parseFloat(computedStyles['marginTop']) + parseFloat(computedStyles['marginBottom'])) || 1) / 2;
  // half the size of the border seems important
  const rowBorders =
    (Math.ceil(parseFloat(computedStyles['borderTopWidth']) + parseFloat(computedStyles['borderBottomWidth'])) || 1) /
    2;
  return Number(rowMargins + rowBorders);
}

/**
 * Gets the true bottom location given an object
 * @param  {Object} elem an element
 * @returns {number} the pixel position of the bottom of the element
 */
export function getTrueBottom(elem) {
  /*
  @bendog: leaving this here as a helper, if there's ever a bug around inner items size
  // get object shape
  const rects = elem.getClientRects();
  const bottom = Math.max(Object.values(rects).map(o => o.bottom), 0);
   */
  // calculate the true bottom
  const bound = elem.getBoundingClientRect();
  const bottom = Math.floor(bound.top + bound.height);
  return Number(bottom);
}

/**
 * Gets the row number for a given x and y pixel location
 * @param  {number} x The x coordinate of the pixel location
 * @param  {number} y The y coordinate of the pixel location
 * @param  {Object} topDiv Div to search under
 * @returns {number} The row number
 */
export function getNearestRowNumber(x, y, topDiv = document) {
  let elementsAtPixel = document.elementsFromPoint(x, y);
  let targetRow = _.find(elementsAtPixel, e => {
    const inDiv = topDiv.contains(e);
    return inDiv && e.hasAttribute('data-row-index');
  });
  return targetRow ? targetRow.getAttribute('data-row-index') : 0;
}

/**
 * Use to find the height of a row, given a set of items
 * @param  {Object[]} items List of items
 * @returns {number} Max row height
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
