import React from 'react';
/**
 * Render all items in a row
 * @param  {object[]} items List of items to render for this row
 * @param  {moment} vis_start The visible start of the timeline
 * @param  {moment} vis_end The visible end of the timeline
 * @param  {number} total_width pixel width of the timeline
 */
export function groupRenderer(group) {
  return (
    <span group-index={group.id} className="rct9k-groups-outer">
      {group.title}
    </span>
  );
}
