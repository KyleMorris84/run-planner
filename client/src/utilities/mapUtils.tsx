import { useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import type { Coordinate, Marker } from "@/types/Map";

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {

    let lat1_rad = lat1 * Math.PI / 180;
    let lon1_rad = lon1 * Math.PI / 180;
    let lat2_rad = lat2 * Math.PI / 180;
    let lon2_rad = lon2 * Math.PI / 180;

    const dLat = lat2_rad - lat1_rad
    const dLon = lon2_rad - lon1_rad

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1_rad) * Math.cos(lat2_rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * 6371 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculatePathLength(markers: Marker[]): number {
    let totalLength = 0;
    for (let i = 1; i < markers.length; i++) {
        totalLength += calculateDistance(markers[i - 1].position[0], markers[i - 1].position[1], markers[i].position[0], markers[i].position[1]);
    }
    return parseFloat(totalLength.toFixed(2));
}

export function calculateDistances(markers: Marker[]): number[] {
    let distances = [] as number[];
    for (let i = 0; i < markers.length; i++) {
        if (i === 0) {
            distances.push(0);
        } else {
            const dist = calculateDistance(markers[i - 1].position[0], markers[i - 1].position[1], markers[i].position[0], markers[i].position[1]);
            distances.push(parseFloat((distances[i - 1] + dist).toFixed(2)));
        }
    }
    return (distances);
}

export function ChangeView({ center }: { center: Coordinate }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, 17, { duration: 2 });
    }, [center, map]);

    return null;
}

export function HandleMapEvents({ setMarkers }: { setMarkers: React.Dispatch<React.SetStateAction<Marker[]>> }) {

    useMapEvents({
        click: async (event) => {
            try {
                var elevation = await getElevation(event.latlng.lat, event.latlng.lng);
            } catch (error) {
                console.log("Elevation fetch error:", error);
                elevation = 1;
            }
            setMarkers(current => {
                var nextId = (current.length > 0) ? current[current.length - 1].id + 1 : 1;
                return [...current, { id: nextId, position: [event.latlng.lat, event.latlng.lng], elevation: elevation }];
            });
        }
    })

    return null;
}

async function getElevation(lat: number, lon: number): Promise<number> {
    try {
        console.log(`${import.meta.env.VITE_OPEN_ELEVATION_API_URL_BASE}/lookup?locations=${lat},${lon}`);
        const response = await fetch(`${import.meta.env.VITE_OPEN_ELEVATION_API_URL_BASE}/lookup?locations=${lat},${lon}`);
        // const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].elevation;
        } else {
            throw new Error("No elevation data found");
        }
    } catch (error) {
        throw new Error("Failed to fetch elevation data");
    }
}