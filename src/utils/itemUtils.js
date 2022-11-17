'use strict';

import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import {Item, RowLayer} from '../index';

/**
 * Render all items in a row
 * @external {moment} http://momentjs.com/
 * @param  {Item[]} items List of items to render for this row
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width pixel width of the timeline
 * @param  {number} itemHeight The height of the item in px
 * @param  {function} itemRenderer The renderer of the item
 * @param  {Object[]} selectedItems
 * @param  {Object} itemRendererDefaultProps
 * @param  {function} getStartFromItem Function that returns the start of an item
 * @param  {function} getEndFromItem Function that returns the end of an item
 */
export function rowItemsRenderer(
  items,
  vis_start,
  vis_end,
  total_width,
  itemHeight,
  itemRenderer,
  selectedItems = [],
  itemRendererDefaultProps,
  getStartFromItem,
  getEndFromItem
) {
  const start_end_ms = vis_end.diff(vis_start, 'milliseconds');
  const pixels_per_ms = total_width / start_end_ms;
  let filtered_items = _.sortBy(
    _.filter(items, i => {
      // if end not before window && start not after window
      return !getEndFromItem(i).isBefore(vis_start) && !getStartFromItem(i).isAfter(vis_end);
    }),
    i => -getStartFromItem(i).unix()
  ); // sorted in reverse order as we iterate over the array backwards
  let displayItems = [];
  let rowOffset = 0;
  while (filtered_items.length > 0) {
    let lastEnd = null;
    for (let i = filtered_items.length - 1; i >= 0; i--) {
      if (lastEnd === null || getStartFromItem(filtered_items[i]) >= lastEnd) {
        let item = _.clone(filtered_items[i]);
        item.rowOffset = rowOffset;
        displayItems.push(item);
        filtered_items.splice(i, 1);
        lastEnd = getEndFromItem(item);
      }
    }
    rowOffset++;
  }
  return _.map(displayItems, i => {
    const Comp = itemRenderer;
    let top = itemHeight * i['rowOffset'];
    // itemHeight is also used to calculate the row height; the row height is the maximum number of overlapping items
    // in a row multiplied with itemHeight.
    // If the max overlapping items is 1, then itemHeight = row height,
    // but we need to subtract 10 because of the margin (see rct9k-items-inner class in style.css)
    const adjustedItemHeight = itemHeight - 10;
    let item_offset_mins = getStartFromItem(i).diff(vis_start, 'milliseconds');
    let item_duration_mins = getEndFromItem(i).diff(getStartFromItem(i), 'milliseconds');
    let left = Math.round(item_offset_mins * pixels_per_ms);
    let width = Math.round(item_duration_mins * pixels_per_ms);
    let compClassnames = (i.className || itemRendererDefaultProps.className) + ' rct9k-items-inner';
    let outerClassnames = 'rct9k-items-outer item_draggable';
    let style = {};
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
        style={{left, width, top, backgroundColor: 'transparent'}}>
        <Comp {...itemRendererDefaultProps} {...i} item={i} className={compClassnames} height={adjustedItemHeight} />
      </span>
    );
  });
}

/**
 * Render row layers
 * @param  {RowLayer[]} layers List of layers to render for this row
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width pixel width of the timeline
 * @param  {number} itemHeight The layer height in px
 * @param  {function} getStartFromRowLayer Function that returns the start of a row layer
 * @param  {function} getEndFromRowLayer Function that returns the end of a row layer
 */
export function rowLayerRenderer(
  layers,
  vis_start,
  vis_end,
  total_width,
  itemHeight,
  getStartFromRowLayer,
  getEndFromRowLayer
) {
  const start_end_ms = vis_end.diff(vis_start, 'milliseconds');
  const pixels_per_ms = total_width / start_end_ms;
  let filtered_items = _.sortBy(
    _.filter(layers, i => {
      return !getEndFromRowLayer(i).isBefore(vis_start) && !getStartFromRowLayer(i).isAfter(vis_end);
    }),
    i => -getStartFromRowLayer(i).unix()
  ); // sorted in reverse order as we iterate over the array backwards
  let displayItems = [];
  let rowOffset = 0;
  while (filtered_items.length > 0) {
    let lastEnd = null;
    for (let i = filtered_items.length - 1; i >= 0; i--) {
      if (lastEnd === null || getStartFromRowLayer(filtered_items[i]) >= lastEnd) {
        let item = _.clone(filtered_items[i]);
        item.rowOffset = rowOffset;
        displayItems.push(item);
        filtered_items.splice(i, 1);
        lastEnd = getEndFromRowLayer(item);
      }
    }
    rowOffset++;
  }
  return _.map(displayItems, i => {
    const {style, rowNumber} = i;
    let top = itemHeight * i['rowOffset'];
    let item_offset_mins = getStartFromRowLayer(i).diff(vis_start, 'milliseconds');
    let item_duration_mins = getEndFromRowLayer(i).diff(getStartFromRowLayer(i), 'milliseconds');
    let left = Math.round(item_offset_mins * pixels_per_ms);
    let width = Math.round(item_duration_mins * pixels_per_ms);
    let height = itemHeight - (rowNumber === 0 ? 2 : 1); // for border
    let outerClassnames = 'rct9k-row-layer';

    return (
      <div
        key={`r-${rowNumber}-${getStartFromRowLayer(i).unix()}`}
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
 * @param  {Item[]} items List of items
 * @param  {function} getStartFromItem Function that returns the start of an item.
 * @param  {function} getEndFromItem Function that returns the end of an item.
 * @param  {boolean} useMoment This parameter is necessary because this method is also called when
 * the component receives new props.
 * @returns {number} Max row height
 */
export function getMaxOverlappingItems(items, getStartFromItem, getEndFromItem, useMoment) {
  let max = 0;
  let sorted_items = _.sortBy(items, i => -getStartFromItem(i, useMoment).unix());
  while (sorted_items.length > 0) {
    let lastEnd = null;
    for (let i = sorted_items.length - 1; i >= 0; i--) {
      if (lastEnd === null || getStartFromItem(sorted_items[i], useMoment) >= lastEnd) {
        lastEnd = getEndFromItem(sorted_items[i], useMoment);
        sorted_items.splice(i, 1);
      }
    }
    max++;
  }
  return Math.max(max, 1);
}
