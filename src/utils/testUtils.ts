import { fireEvent } from '@testing-library/dom';

export const rightClick = (element, options = {}) => {
    fireEvent.mouseDown(element, {button: 2, ...options});
    fireEvent.mouseUp(element, {button: 2, ...options});
    fireEvent.contextMenu(element, options);
}