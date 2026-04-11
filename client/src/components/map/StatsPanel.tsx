import { Typography } from "@mui/material";
import { memo } from "react";
import ElevationChart from "./ElevationChart";
import type { Marker } from "@/types/Map";

const PANEL_WIDTH = 360;
const PACE_MIN_PER_KM = 6; // estimated running pace used for time calculation

interface StatsPanelProps {
    open: boolean;
    markers: Marker[];
    distances: number[];
    pathLength: number;
    elevationGain: number;
    elevationLoss: number;
    onHighlightChange: (index: number | null) => void;
}

function formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h === 0) return `${m} min`;
    return `${h}h ${m}m`;
}

export default memo(function StatsPanel({
    open, markers, distances, pathLength, elevationGain, elevationLoss, onHighlightChange,
}: StatsPanelProps) {
    const hasRoute = markers.length >= 2;

    const highestPoint = hasRoute ? Math.max(...markers.map(m => m.elevation ?? 0)) : null;
    const lowestPoint = hasRoute ? Math.min(...markers.map(m => m.elevation ?? 0)) : null;
    const estimatedTime = hasRoute ? formatTime(pathLength * PACE_MIN_PER_KM) : null;
    const netChange = elevationGain - elevationLoss;

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: PANEL_WIDTH,
                background: "white",
                borderLeft: "1px solid #e0e0e0",
                zIndex: 1000,
                transform: open ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.25s ease",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
            }}
        >
            <div className="px-4 pt-4 pb-2">
                <Typography variant="subtitle2" fontWeight={700}>Elevation Profile</Typography>
            </div>

            {hasRoute ? (
                <ElevationChart
                    markers={markers}
                    distances={distances}
                    onHighlightChange={onHighlightChange}
                />
            ) : (
                <div className="flex items-center justify-center px-4" style={{ height: 180 }}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Add at least 2 points to see the elevation profile.
                    </Typography>
                </div>
            )}

            <div className="px-4 pb-4 pt-2">
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Route Stats</Typography>
                <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Distance" value={hasRoute ? `${pathLength} km` : "—"} />
                    <StatCard
                        label="Est. time"
                        value={estimatedTime ?? "—"}
                        sub={hasRoute ? `at ${PACE_MIN_PER_KM} min/km` : undefined}
                    />
                    <StatCard label="Elevation gain" value={hasRoute ? `+${elevationGain} m` : "—"} valueColor="#2e7d32" />
                    <StatCard label="Elevation loss" value={hasRoute ? `-${elevationLoss} m` : "—"} valueColor="#c62828" />
                    <StatCard
                        label="Net elevation"
                        value={hasRoute ? `${netChange >= 0 ? "+" : ""}${netChange} m` : "—"}
                        valueColor={netChange >= 0 ? "#2e7d32" : "#c62828"}
                    />
                    <StatCard label="Highest point" value={highestPoint !== null ? `${Math.round(highestPoint)} m` : "—"} />
                    <StatCard label="Lowest point" value={lowestPoint !== null ? `${Math.round(lowestPoint)} m` : "—"} />
                    <StatCard label="Waypoints" value={String(markers.length)} />
                </div>
            </div>
        </div>
    );
});

function StatCard({ label, value, sub, valueColor }: {
    label: string;
    value: string;
    sub?: string;
    valueColor?: string;
}) {
    return (
        <div style={{ background: "#f5f5f5", borderRadius: 6, padding: "8px 10px" }}>
            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
            <Typography variant="body2" fontWeight={700} style={{ color: valueColor }}>{value}</Typography>
            {sub && <Typography variant="caption" color="text.disabled">{sub}</Typography>}
        </div>
    );
}
