import { LineChart } from "@mui/x-charts/LineChart";
import { memo } from "react";
import type { Marker } from "@/types/Map";
import type { AxisItemIdentifier } from "@mui/x-charts";

interface ElevationChartProps {
    markers: Marker[];
    distances: number[];
    onHighlightChange?: (index: number | null) => void;
}

export default memo(function ElevationChart({ markers, distances, onHighlightChange }: ElevationChartProps) {
    if (markers.length < 2) return null;

    const elevations = markers.map(m => m.elevation ?? 0);

    const handleAxisHighlight = (axisItems: AxisItemIdentifier[]) => {
        onHighlightChange?.(axisItems[0]?.dataIndex ?? null);
    };

    return (
        <div className="flex justify-center">
            <LineChart
                xAxis={[{ data: distances, label: "Distance (km)", tickMinStep: 0.5 }]}
                yAxis={[{}]}
                series={[{ data: elevations, showMark: false, color: "#1976d2" }]}
                onHighlightedAxisChange={handleAxisHighlight}
                width={370}
                height={190}
                style={{ marginRight: 30 }}
            />
        </div>
    );
});
