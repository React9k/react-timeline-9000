import { IAction, IActionParam, IActionParamForRun, IOnContextMenuShowParam } from "./components/ContextMenu/IAction"

export type Group = {
    id: number,
    title?: string
}

export type InteractOption = {
    draggable?: object,
    pointerEvents?: object,
    resizable?: object
}

export type Item = {
    key: number | string,
    row: number,
    start?: number | object,
    end?: number | object,
    title?: string,
    style?: object,
    className?: string,
    color?: string,
    tooltip?: string,
    gradientStop?: number,
    gradientBrightness?: number,
    gradientReverseDirection?: boolean,
    glowOnHover?: boolean
}

export type RowLayer = {
    start?: number | object,
    end?: number | object,
    rowNumber: number,
    style: object
}

export type DragToCreateParam = {
    groupIndex: number, // Index of selected group
    itemIndex: number, // Index for new item
    itemStart: object, // Start for new item
    itemEnd?: object //  End for new item
}

export interface IGanttOnContextMenuShowParam extends IOnContextMenuShowParam {
    actionParam: IGanttActionParam
}

export interface IGanttActionParam extends IActionParam {
    row : number;
    /**
     * numeric/millis or moment object, cf. `timeline.useMoment`
     */
    time: number | object;
    selection: (number | string)[];
}

export interface IGanttActionParamForRun extends IGanttActionParam, IActionParamForRun {
}

export interface IGanttAction extends IAction {
    run?: (param: IGanttActionParamForRun) => void,
    label?: string | ((param: IGanttActionParam) => string),
    renderInMenu?: (param: IGanttActionParamForRun) => React.ReactElement
}