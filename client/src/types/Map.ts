export type Coordinate = [number, number];

export type Marker = {
    id: number,
    position: Coordinate,
    elevation: number | null,
    highlight?: boolean
}