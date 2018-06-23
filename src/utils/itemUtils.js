import _ from 'lodash';

export function getItemMarginClass(itemCols, currentCol) {
  let className = 'rct9k-items-inner';

  const max = _.max(itemCols);
  const min = _.min(itemCols);
  if (currentCol === max) className = className + ' rct9k-items-inner-right';
  if (currentCol === min) className = className + ' rct9k-items-inner-left';
  return className;
}
