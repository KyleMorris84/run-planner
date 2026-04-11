import { ChangeView, HandleMapEvents, calculateDistances, calculateElevationGain, calculateElevationLoss, calculatePathLength, exportToGPX } from "@/utilities/mapUtils";
import { MapContainer, TileLayer, Polyline, Marker as ReactLeafletMarker } from "react-leaflet";
import type { Coordinate, Marker } from "@/types/Map";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, TextField, Typography } from "@mui/material";
import TopBar from "./map/TopBar";
import Toolbar from "./map/Toolbar";
import FloatingSearch from "./map/FloatingSearch";
import StatsPanel from "./map/StatsPanel";
import type { LeafletMouseEvent } from "leaflet";
import L from "leaflet";

const markerIcon = L.divIcon({
    className: "",
    html: '<div style="width:14px;height:14px;background:#1565c0;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.35);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const highlightedMarkerIcon = L.divIcon({
    className: "",
    html: '<div style="width:20px;height:20px;background:#ff6f00;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

interface MapProps {
    center: Coordinate;
    onSearch: (postCode: string) => void;
}

export default function Map({ center, onSearch }: MapProps) {
    // --- Undo/redo history ---
    const [history, setHistory] = useState<Marker[][]>([[]]); // start with empty route
    const [historyIndex, setHistoryIndex] = useState(0);
    const markers = history[historyIndex];

    // Keep a ref so async handlers (click) always see current markers
    const markersRef = useRef<Marker[]>(markers);
    useEffect(() => { markersRef.current = markers; }, [markers]);

    const pushHistory = useCallback((newMarkers: Marker[]) => {
        setHistory(prev => {
            const trimmed = prev.slice(0, historyIndex + 1);
            return [...trimmed, newMarkers];
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    // --- Derived stats ---
    const pathLength = useMemo(() => calculatePathLength(markers), [markers]);
    const distances = useMemo(() => calculateDistances(markers), [markers]);
    const elevationGain = useMemo(() => calculateElevationGain(markers), [markers]);
    const elevationLoss = useMemo(() => calculateElevationLoss(markers), [markers]);

    // --- Live drag position (updates polyline without touching history) ---
    const [draggingPosition, setDraggingPosition] = useState<{ id: number; position: Coordinate } | null>(null);

    const polylinePositions = useMemo(() =>
        markers.map(m => draggingPosition?.id === m.id ? draggingPosition.position : m.position),
        [markers, draggingPosition]
    );

    // --- UI state ---
    const [locked, setLocked] = useState(false);
    const [elevationOpen, setElevationOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; markerId: number } | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    // Close context menu on any mousedown outside it
    useEffect(() => {
        if (!contextMenu) return;
        const onMouseDown = (e: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
                setContextMenu(null);
            }
        };
        window.addEventListener("mousedown", onMouseDown);
        return () => window.removeEventListener("mousedown", onMouseDown);
    }, [contextMenu]);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [saveDescription, setSaveDescription] = useState("");

    // --- Toolbar actions ---
    const handleUndo = () => setHistoryIndex(prev => prev - 1);
    const handleRedo = () => setHistoryIndex(prev => prev + 1);

    const handleReverse = () => {
        if (locked || markers.length === 0) return;
        pushHistory([...markers].reverse());
    };

    const handleClear = () => {
        pushHistory([]);
        setClearDialogOpen(false);
    };

    const handleExport = () => exportToGPX(markers, saveName || "Route");

    // --- Marker add (called by HandleMapEvents) ---
    const handleMarkerAdd = useCallback((marker: Marker) => {
        const current = markersRef.current;
        pushHistory([...current, marker]);
    }, [pushHistory]);

    // --- Marker drag ---
    const handleMarkerDrag = (id: number, e: LeafletMouseEvent) => {
        const { lat, lng } = (e as any).target.getLatLng();
        setDraggingPosition({ id, position: [lat, lng] as Coordinate });
    };

    const handleMarkerDragEnd = (id: number, e: LeafletMouseEvent) => {
        const { lat, lng } = (e as any).target.getLatLng();
        setDraggingPosition(null);
        pushHistory(markers.map(m =>
            m.id === id ? { ...m, position: [lat, lng] as Coordinate } : m
        ));
    };

    // --- Right-click context menu ---
    const handleMarkerContextMenu = (id: number, e: LeafletMouseEvent) => {
        if (locked) return;
        (e as any).originalEvent.preventDefault();
        (e as any).originalEvent.stopPropagation();
        setContextMenu({ x: (e as any).originalEvent.clientX, y: (e as any).originalEvent.clientY, markerId: id });
    };

    const handleContextMenuDelete = () => {
        if (contextMenu) {
            pushHistory(markers.filter(m => m.id !== contextMenu.markerId));
            setContextMenu(null);
        }
    };

    // --- Delete key: removes last marker ---
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (locked) return;
                const current = markersRef.current;
                if (current.length === 0) return;
                // Only fire if focus is not inside an input
                if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
                pushHistory(current.slice(0, -1));
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [locked, pushHistory]);

    // pushHistory captures historyIndex via closure — keep markersRef in sync separately
    // We need a stable ref to pushHistory too for the keydown handler
    const pushHistoryRef = useRef(pushHistory);
    useEffect(() => { pushHistoryRef.current = pushHistory; }, [pushHistory]);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <TopBar
                pathLength={pathLength}
                elevationGain={elevationGain}
                elevationLoss={elevationLoss}
                markers={markers}
                elevationOpen={elevationOpen}
                onToggleElevation={() => setElevationOpen(prev => !prev)}
            />

            <div className="flex flex-1 min-h-0">
                <Toolbar
                    canUndo={historyIndex > 0}
                    canRedo={historyIndex < history.length - 1}
                    locked={locked}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onClear={() => setClearDialogOpen(true)}
                    onReverse={handleReverse}
                    onExport={handleExport}
                    onSave={() => setSaveDialogOpen(true)}
                    onToggleLock={() => setLocked(prev => !prev)}
                />

                <div
                    className="relative flex flex-col flex-1 min-h-0 overflow-hidden"
                    onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
                >
                    <FloatingSearch onSearch={onSearch} />

                    <MapContainer center={center} zoom={13} scrollWheelZoom={true} maxZoom={22} className="map">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxZoom={22}
                            maxNativeZoom={19}
                        />

                        <ChangeView center={center} />
                        <HandleMapEvents onMarkerAdd={handleMarkerAdd} locked={locked} markersRef={markersRef} />

                        <Polyline pathOptions={{ color: "red" }} positions={polylinePositions} />

                        {markers.map((m, i) =>
                            <ReactLeafletMarker
                                key={`marker-${m.id}`}
                                position={m.position}
                                draggable={!locked}
                                icon={i === highlightedIndex ? highlightedMarkerIcon : markerIcon}
                                eventHandlers={{
                                    drag: (e) => handleMarkerDrag(m.id, e as unknown as LeafletMouseEvent),
                                    dragend: (e) => handleMarkerDragEnd(m.id, e as unknown as LeafletMouseEvent),
                                    contextmenu: (e) => handleMarkerContextMenu(m.id, e as unknown as LeafletMouseEvent),
                                }}
                            />
                        )}
                    </MapContainer>

                    <StatsPanel
                        open={elevationOpen}
                        markers={markers}
                        distances={distances}
                        pathLength={pathLength}
                        elevationGain={elevationGain}
                        elevationLoss={elevationLoss}
                        onHighlightChange={setHighlightedIndex}
                    />
                </div>
            </div>

            {/* Right-click context menu */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x, zIndex: 9999 }}
                    className="bg-white rounded shadow-lg overflow-hidden min-w-36 py-1"
                >
                    <button
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                        onClick={handleContextMenuDelete}
                    >
                        Delete point
                    </button>
                </div>
            )}

            {/* Clear confirmation dialog */}
            <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
                <DialogTitle>Clear route?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">This will remove all points from the route. This can be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleClear} color="error" variant="contained">Clear</Button>
                </DialogActions>
            </Dialog>

            {/* Save dialog */}
            <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Save Route</DialogTitle>
                <DialogContent className="flex flex-col gap-4 pt-2">
                    <TextField
                        label="Route name"
                        value={saveName}
                        onChange={e => setSaveName(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        label="Description (optional)"
                        value={saveDescription}
                        onChange={e => setSaveDescription(e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                    />
                    <Divider />
                    <Typography variant="caption" color="text.secondary">
                        Saving routes to your account is coming soon. You can export as GPX in the meantime.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" disabled>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
