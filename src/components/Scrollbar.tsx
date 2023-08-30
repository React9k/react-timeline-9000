import React from "react";
import Measure from 'react-measure';

export interface ScrollbarProperties {
    /**
     * A number which represents the maximum scroll position
     */
    minScrollPosition: number;

    /**
     * A number which represents the minimum scroll position
     */
    maxScrollPosition: number;

    /**
     * The number of lines equivalent to one page.
     */
    pageSize: number;

    /**
     * The initial position of the scroll thumb
     */
    scrollPosition?: number;

    /**
     * Can be both `Direction.HORIZONTAL`(the default value) or `Direction.VERTICAL`
     */
    direction?: Direction;

    /**
     * By default Semantic ui hides the increase/decrease arrow buttons of the scrollbars on Webkit based browsers. So it default to false.
     * This should be set to true if the scrollbar needs to display the arrow buttons.
     */
    hasArrows?: boolean;
    
    /**
     * This handler is called when the scrollbar is scrolled.
     * It receives as parameter the current scrollPosition
     * This handler can be used for example to synchronize the scrollbar position with a virtual scroll of another component
     *
     *  @param scrollPosition 
     * @returns 
     */
    onScroll?: (scrollPosition: number) => void;

    /**
     * If the configuration of the scrollbar doesn't require scrolling (i.e. the min-max interval is smaller than the pageSize)
     * the Scrollbar component doesn't display nothing. 
     * 
     * This handler can be used to detect when the scrollbar is not required to be displayed
     * 
     * @param isScrollbarVisible 
     * @returns 
     */
    onVisibilityChange?: (isScrollbarVisible: boolean) => void;
}

export enum Direction {
    HORIZONTAL,
    VERTICAL
}

export const SCROLLBAR_SIZE = 10;
const ROUND_FACTOR = 4;

export class Scrollbar extends React.Component<ScrollbarProperties, { scrollbarSize: number }> {
   
    static defaultProps = {
        scrollPosition: 0,
        direction: Direction.HORIZONTAL,
        hasArrows: false
    }

    _outterDiv: HTMLDivElement;

    constructor(props) {
        super(props);
        this.state = {
            scrollbarSize: 0
        };
    }
    
    /**
     * Designed to be call by the parent component
     * (for example when parent component whats to implement scroll by touching the scrollable container on the mobile devices)
     * 
     * @param delta 
     */
    scrollwithDelta(delta: number) {
        const unit_per_px = this.props.pageSize / this.state.scrollbarSize;
        const pixels_per_unit = this.state.scrollbarSize / this.props.pageSize;
        const scrollPositionInPixels = this.props.direction == Direction.HORIZONTAL ? this._outterDiv.scrollLeft : this._outterDiv.scrollTop;
        const scrollPosition = this.props.minScrollPosition + unit_per_px * scrollPositionInPixels;
        let newScrollPosition = scrollPosition + delta;
        if (newScrollPosition < this.props.minScrollPosition) {
            newScrollPosition = this.props.minScrollPosition;
        } else if (newScrollPosition > this.props.maxScrollPosition) {
            newScrollPosition = this.props.maxScrollPosition;
        } 

        this.setScrollPositionInPx((newScrollPosition - this.props.minScrollPosition) * pixels_per_unit);
    }

    componentDidMount(): void {
        if (this.props.onVisibilityChange) {
            this.props.onVisibilityChange(this.isScrollbarNeeded(this.props));
        } 
    }

    componentWillReceiveProps(nextProps: Readonly<ScrollbarProperties>): void {
        if (nextProps.onVisibilityChange && this.isScrollbarNeeded(nextProps) != this.isScrollbarNeeded(this.props)) {
            nextProps.onVisibilityChange(this.isScrollbarNeeded(nextProps));
        } 

        if (nextProps.minScrollPosition != this.props.minScrollPosition || 
            nextProps.maxScrollPosition != this.props.maxScrollPosition ||
            nextProps.pageSize != this.props.pageSize ||
            nextProps.scrollPosition != this.props.scrollPosition) { 
            this.setScrollPosition(nextProps);
        }
    }

    componentDidUpdate(prevProps: Readonly<ScrollbarProperties>, prevState: Readonly<{ scrollbarSize: number; }>, snapshot?: any): void {
        if (this.state.scrollbarSize != prevState.scrollbarSize) {
            this.setScrollPosition(this.props);
        }
    }

    setScrollPosition(props: ScrollbarProperties) {
        const pixels_per_unit = this.state.scrollbarSize / props.pageSize;
       this.setScrollPositionInPx((props.scrollPosition - props.minScrollPosition) * pixels_per_unit);
    }

    setScrollPositionInPx(scrollPositionInPixels) {
        if (!this._outterDiv) {
            return;
        }
        
        // We need this check because else a small flicker appears on the scrollbar when scrolling
        // a scrollbar that is "double binded" to a state variable in the parent component (e.g. in gantt)
        // It is caused by a small precision lost when converting from pixels to client unit and then back again
        const oldScrollPositionInPixels = this.props.direction == Direction.HORIZONTAL ? this._outterDiv.scrollLeft : this._outterDiv.scrollTop;
        if (roundDoubleToDecimals(scrollPositionInPixels) == roundDoubleToDecimals(oldScrollPositionInPixels)) {
            return;
        }
        
        if (this.props.direction == Direction.HORIZONTAL) {
            this._outterDiv.scrollLeft = scrollPositionInPixels;
        } else {
            this._outterDiv.scrollTop = scrollPositionInPixels;
        }
    }

    onScroll() {
        const unit_per_px = this.props.pageSize / this.state.scrollbarSize;
        const scrollPositionInPixels = this.props.direction == Direction.HORIZONTAL ? this._outterDiv.scrollLeft : this._outterDiv.scrollTop;
        this.props.onScroll(this.props.minScrollPosition + unit_per_px * scrollPositionInPixels);
    }

    getInnerDivSize(): number {
        const pixels_per_unit = this.state.scrollbarSize / this.props.pageSize;
        return (this.props.maxScrollPosition - this.props.minScrollPosition) * pixels_per_unit;
    }

    isScrollbarNeeded(props: ScrollbarProperties): boolean {
        return (props.maxScrollPosition - props.minScrollPosition) > props.pageSize;
    }

    getOutterDivClassName() {
        let className = (this.props.direction == Direction.HORIZONTAL ? "rct9k-horizontal-scrollbar-outter" : "rct9k-vertical-scrollbar-outter");
        return className + (this.props.hasArrows ? " rct9k-scrollbar-with-arrows" : "");
    }

    render(): React.ReactNode {
        return <Measure
            bounds
            onResize={contentRect => {
                const newSize = contentRect.bounds ? (this.props.direction == Direction.HORIZONTAL ? contentRect.bounds.width : contentRect.bounds.height) : 0;
                if (newSize != this.state.scrollbarSize) {
                    this.setState({ scrollbarSize: newSize });
                }
            }}>
            {({ measureRef }) => {
                return (
                    this.isScrollbarNeeded(this.props) ?
                    <div
                        className={this.getOutterDivClassName()}
                        style={this.props.direction == Direction.HORIZONTAL ? {height: SCROLLBAR_SIZE} : {width: SCROLLBAR_SIZE}}
                        ref={(node) => {
                            measureRef(node);
                            this._outterDiv = node;
                        }
                        }
                        onScroll={() => this.onScroll()}>
                        <div
                            className={this.props.direction == Direction.HORIZONTAL ? "rct9k-horizontal-scrollbar-inner" : "rct9k-vertical-scrollbar-inner"}
                            style={this.props.direction == Direction.HORIZONTAL ? { width: this.getInnerDivSize() } : { height: this.getInnerDivSize() }}>
                        </div>
                    </div>
                    : <></>
                );
            }}
        </Measure>
    }
}

const roundDoubleToDecimals = (value: number) => {
    if (value == 0) {
        return value;
    }
    let roundFactor = Math.pow(10, ROUND_FACTOR);
    return Math.round(value * roundFactor) / roundFactor;
}