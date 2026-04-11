import { Divider, IconButton, Tooltip } from "@mui/material";
import { ArrowLeftRight, Download, Lock, LockOpen, Redo2, Save, Trash2, Undo2 } from "lucide-react";

interface ToolbarProps {
    canUndo: boolean;
    canRedo: boolean;
    locked: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    onReverse: () => void;
    onExport: () => void;
    onSave: () => void;
    onToggleLock: () => void;
}

export default function Toolbar({
    canUndo, canRedo, locked,
    onUndo, onRedo, onClear, onReverse, onExport, onSave, onToggleLock,
}: ToolbarProps) {
    return (
        <div
            className="flex flex-col items-center py-2 gap-1"
            style={{ width: "48px", borderRight: "1px solid #e0e0e0", background: "#fafafa" }}
        >
            <ToolButton label="Undo" disabled={locked || !canUndo} onClick={onUndo}>
                <Undo2 size={18} />
            </ToolButton>
            <ToolButton label="Redo" disabled={locked || !canRedo} onClick={onRedo}>
                <Redo2 size={18} />
            </ToolButton>

            <Divider flexItem sx={{ my: 0.5 }} />

            <ToolButton label="Reverse route" disabled={locked} onClick={onReverse}>
                <ArrowLeftRight size={18} />
            </ToolButton>
            <ToolButton label="Clear all" disabled={locked} onClick={onClear}>
                <Trash2 size={18} />
            </ToolButton>

            <Divider flexItem sx={{ my: 0.5 }} />

            <ToolButton label="Export GPX" onClick={onExport}>
                <Download size={18} />
            </ToolButton>
            <ToolButton label="Save route" onClick={onSave}>
                <Save size={18} />
            </ToolButton>

            <Divider flexItem sx={{ my: 0.5 }} />

            <ToolButton label={locked ? "Unlock route" : "Lock route"} onClick={onToggleLock}>
                {locked ? <LockOpen size={18} /> : <Lock size={18} />}
            </ToolButton>
        </div>
    );
}

function ToolButton({ label, disabled, onClick, children }: {
    label: string;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Tooltip title={label} placement="right">
            <span>
                <IconButton size="small" disabled={disabled} onClick={onClick} sx={{ borderRadius: 1 }}>
                    {children}
                </IconButton>
            </span>
        </Tooltip>
    );
}
