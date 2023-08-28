import React from "react";
import Measure from 'react-measure';

export interface ScrollbarProperties {
    minScrollPosition: number;
    maxScrollPosition: number;
    pageSize: number;
    scrollPosition?: number;
    pageScrollSize?: number;
    lineScrollSize?: number;
    direction?: Direction;
    onScroll?: (scrollPosition: number) => void;
}

export enum Direction {
    HORIZONTAL,
    VERTICAL
}


export class Scrollbar extends React.Component<ScrollbarProperties, { scrollbarSize: number }> {
   
    static defaultProps = {
        scrollPosition: 0,
        direction: Direction.HORIZONTAL
    }

    _outterDiv: HTMLDivElement;

    constructor(props) {
        super(props);
        this.state = {
            scrollbarSize: 0
        };
    }

    componentWillReceiveProps(nextProps: Readonly<ScrollbarProperties>): void {
        // TODO DB if other properties has change and the scrollPosition not. Maintain the old scroll position => see example in gwt
        
        // TODO Don't know why this method is called continuously, but because of this, we need this check, in order to be sure that configuration has changed
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
        const scrollPositionInPixels = (props.scrollPosition - props.minScrollPosition) * pixels_per_unit;
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
                {
                    //TODO DB: set the width using flex
                }
                return (<div
                    className={this.props.direction == Direction.HORIZONTAL ? "rct9k-horizontal-scrollbar-outter" : "rct9k-vertical-scrollbar-outter"}
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
                </div>);
            }}
        </Measure>
    }
}