/**
 * Add int pixels to a css style (left or top generally)
 * @param  {string} style Style string in css format
 * @param  {number} diff The pixels to add/subtract
 * @returns {string} Style as string for css use
 */
export function sumStyle(style: String, diff: number): String {
  return intToPix(pixToInt(style) + diff);
}
/**
 * Converts a pixel string to an int
 * @param  {string} pix Pixel string
 * @return {number} Integer value of the pixel string
 */
export function pixToInt(pix: String): number {
  return parseInt(pix.replace('px', ''));
}
/**
 * Convert integer to pixel string.
 * @param  {number} int value
 * @returns {string} Pixel string
 */
export function intToPix(int: number): String {
  return int + 'px';
}
