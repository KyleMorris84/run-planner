import { ChangeView, HandleMapEvents } from "@/utilities/mapUtils";
import { MapContainer, TileLayer, Polyline, Marker as ReactLeafletMarker } from "react-leaflet";
import type { Coordinate, Marker } from "@/types/Map";
import { Box } from "@mui/material";
// import L from "leaflet";

export default function Map({ center, markers, setMarkers }: { center: Coordinate, markers: Marker[], setMarkers: any }) {

    const handleMarkerClick = (id: number) => {
        setMarkers((prev: Marker[]) => prev.filter((marker) => marker.id !== id));
    };

    return (
        <Box>
            <Box sx={{ height: "50px", outline: "1px solid darkgray", margin: "1px" }}>TOP BAR (stats)</Box>
            <Box display="flex">
                <Box sx={{ height: "auto", width: "50px", outline: "1px solid darkgray", margin: "0px 1px 1px 1px" }}>SIDE<br />BAR<br />(tools)</Box>
                <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="map">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <ChangeView center={center} />
                    <HandleMapEvents setMarkers={setMarkers} />

                    <Polyline pathOptions={{ color: 'red' }} positions={markers.map(m => m.position)} />

                    {markers.map(m =>
                        <ReactLeafletMarker
                            key={`marker-${m.id}`}
                            position={m.position}
                            eventHandlers={{
                                click: () => handleMarkerClick(m.id),
                            }}
                        // icon={
                        //     m.highlight
                        //         ? new L.Icon({
                        //             iconUrl: './marker-highlighted-2.png',
                        //             iconSize: [25, 41],
                        //             iconAnchor: [12, 41]
                        //         })
                        //         : new L.Icon({
                        //             iconUrl: './marker.png',
                        //             iconSize: [25, 41],
                        //             iconAnchor: [12, 41]
                        //         })
                        // }
                        />
                    )}
                </MapContainer>
            </Box>
        </Box>
    )
}