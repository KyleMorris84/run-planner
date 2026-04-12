import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { ChartLine, TrendingDown, TrendingUp } from "lucide-react";
import type { Marker } from "@/types/Map";
import { useEffect, useRef, useState } from "react";

interface TopBarProps {
    pathLength: number;
    elevationGain: number;
    elevationLoss: number;
    markers: Marker[];
    elevationOpen: boolean;
    onToggleElevation: () => void;
    routeName: string;
    onNameChange: (name: string) => void;
}

export default function TopBar({ pathLength, elevationGain, elevationLoss, markers, elevationOpen, onToggleElevation, routeName, onNameChange }: TopBarProps) {
    const hasRoute = markers.length >= 2;
    const [editing, setEditing] = useState(false);
    const [nameValue, setNameValue] = useState(routeName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!editing) setNameValue(routeName);
    }, [routeName, editing]);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    const commit = () => {
        const trimmed = nameValue.trim() || "Untitled Route";
        setNameValue(trimmed);
        onNameChange(trimmed);
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
            setNameValue(routeName);
            setEditing(false);
        }
    };

    return (
        <div className="flex items-center gap-2 px-3" style={{ height: "48px", borderBottom: "1px solid #e0e0e0", background: "#fafafa" }}>
            <Box sx={{ minWidth: 80, maxWidth: 160, display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
                {editing ? (
                    <input
                        ref={inputRef}
                        value={nameValue}
                        onChange={e => setNameValue(e.target.value)}
                        onBlur={commit}
                        onKeyDown={handleKeyDown}
                        style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "#555",
                            border: "none",
                            borderBottom: "1.5px solid #1565c0",
                            outline: "none",
                            background: "transparent",
                            width: "100%",
                            padding: "2px 0",
                        }}
                    />
                ) : (
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                        onClick={() => setEditing(true)}
                        title="Click to rename"
                        noWrap
                        sx={{
                            cursor: "text",
                            "&:hover": { color: "text.primary" },
                        }}
                    >
                        {routeName}
                    </Typography>
                )}
            </Box>

            <div className="flex items-center gap-2 flex-1 min-w-0">
                <Stat label="Distance" value={`${pathLength} km`} />
                <Separator />
                <Stat
                    label="Gain"
                    value={`${elevationGain} m`}
                    icon={<TrendingUp size={14} color="#2e7d32" />}
                />
                <Separator />
                <Stat
                    label="Loss"
                    value={`${elevationLoss} m`}
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
        <div className="flex items-center gap-1 shrink-0">
            {icon}
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "inline" } }}>
                {label}:
            </Typography>
            <Typography variant="caption" fontWeight={600}>{value}</Typography>
        </div>
    );
}

function Separator() {
    return (
        <Box
            sx={{
                width: "1px",
                height: 16,
                background: "#ddd",
                flexShrink: 0,
                display: { xs: "none", sm: "block" },
            }}
        />
    );
}
