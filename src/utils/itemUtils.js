import React from 'react';
import _ from 'lodash';

/**
 * @param  {object[]} items List of items to render for this row
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width pixel width of the timeline
 */
export function rowItemsRenderer(items, vis_start, vis_end, total_width) {
  const start_end_min = vis_end.diff(vis_start, 'minutes');
  const pixels_per_min = total_width / start_end_min;

  let filtered_items = _.filter(items, i => {
    // if end not before window && start not after window
    return !i.end.isBefore(vis_start) && !i.start.isAfter(vis_end);
  });
  return _.map(filtered_items, i => {
    let item_offset_mins = i.start.diff(vis_start, 'minutes');
    let item_duration_mins = i.end.diff(i.start, 'minutes');
    let left = Math.floor(item_offset_mins * pixels_per_min);
    let width = Math.floor(item_duration_mins * pixels_per_min);
    const {color} = i;
    return (
      <span key={i.key} className="rct9k-items-inner" style={{left, width, backgroundColor: color}}>
        {i.title}
      </span>
    );
  });
}
