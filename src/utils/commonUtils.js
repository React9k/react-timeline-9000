/**
 * Add int pixels to a css style (left or top generally)
 * @param  {string} style Style string in css format
 * @param  {number} diff The pixels to add/subtract
 * @returns {string} Style as string for css use
 */
export function sumStyle(style, diff) {
  return intToPix(pixToInt(style) + diff);
}

/**
 * Converts a pixel string to an int
 * @param  {string} pix Pixel string
 * @return {number} Integer value of the pixel string
 */
export function pixToInt(pix) {
  return parseInt(pix.replace('px', ''));
}

/**
 * Convert integer to pixel string.
 * If not an integer the input is returned as is
 * @param  {number} int Integer value
 * @returns {string} Pixel string
 */
export function intToPix(int) {
  if (int === Number(int)) return int + 'px';
  return int;
}
