/**
 * Add int pixels to a css style (left or top generally)
 * @param  {string} style in css format
 * @param  {number} diff pixels to add/subtract
 * @returns {string} style as string for css use
 */
export function sumStyle(style, diff) {
  return intToPix(pixToInt(style) + diff);
}
export function pixToInt(pix) {
  return parseInt(pix.replace('px', ''));
}
export function intToPix(int) {
  return int + 'px';
}
