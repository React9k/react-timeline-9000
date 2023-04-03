/**
 * Most of the JS classes/functions have type information as JSDoc (included in the corresponding comments).
 * For some types this was not possible (e.g. because we didn't have actual classes), hence we define them here.
 * They are "included" by the class Timeline.
 */
export type Column = {
    labelProperty: string,
    cellRenderer: Function | JSX.Element,
    headerLabel: string,
    headerRenderer: Function | JSX.Element,
    width: number
}

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
