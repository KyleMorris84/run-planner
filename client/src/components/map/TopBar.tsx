import { IconButton, Tooltip, Typography } from "@mui/material";
import { ChartLine, TrendingDown, TrendingUp } from "lucide-react";
import type { Marker } from "@/types/Map";

interface TopBarProps {
    pathLength: number;
    elevationGain: number;
    elevationLoss: number;
    markers: Marker[];
    elevationOpen: boolean;
    onToggleElevation: () => void;
}

export default function TopBar({ pathLength, elevationGain, elevationLoss, markers, elevationOpen, onToggleElevation }: TopBarProps) {
    const hasRoute = markers.length >= 2;

    return (
        <div className="flex items-center gap-6 px-4" style={{ height: "48px", borderBottom: "1px solid #e0e0e0", background: "#fafafa" }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ minWidth: 100 }}>
                Untitled Route
            </Typography>

            <div className="flex items-center gap-4 flex-1">
                <Stat label="Distance" value={hasRoute ? `${pathLength} km` : "—"} />
                <Separator />
                <Stat
                    label="Gain"
                    value={hasRoute ? `${elevationGain} m` : "—"}
                    icon={<TrendingUp size={14} color="#2e7d32" />}
                />
                <Separator />
                <Stat
                    label="Loss"
                    value={hasRoute ? `${elevationLoss} m` : "—"}
                    icon={<TrendingDown size={14} color="#c62828" />}
                />
            </div>

            <Tooltip title={elevationOpen ? "Hide elevation graph" : "Show elevation graph"}>
                <span>
                    <IconButton
                        size="small"
                        disabled={!hasRoute}
                        onClick={onToggleElevation}
                        sx={{ color: elevationOpen ? "primary.main" : "inherit", borderRadius: 1 }}
                    >
                        <ChartLine size={18} />
                    </IconButton>
                </span>
            </Tooltip>
        </div>
    );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-1">
            {icon}
            <Typography variant="caption" color="text.secondary">{label}:</Typography>
            <Typography variant="caption" fontWeight={600}>{value}</Typography>
        </div>
    );
}

function Separator() {
    return <div style={{ width: 1, height: 16, background: "#ddd" }} />;
}
