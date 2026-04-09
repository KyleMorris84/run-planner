import type { User } from '@/types/User';
import { Box, Button, TextField, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { LineChart } from '@mui/x-charts/LineChart';
import { getCookie } from '@/utilities/cookieManagement';
import { useEffect, useState } from 'react';
import Map from '@/components/Map';
import type { Coordinate, Marker } from '@/types/Map';
import { calculateDistances, calculatePathLength } from '@/utilities/mapUtils';

export const Route = createFileRoute('/')({
  component: Index
})
function Index() {

  const user = getCookie<User>('user');

  const [started, setStarted] = useState(false);
  const [postCode, setPostCode] = useState('LS6 3AD');
  const [position, setPosition] = useState<Coordinate>([53.818235, -1.576158])
  const [markers, setMarkers] = useState<Marker[]>([])
  const [pathLength, setPathLength] = useState(0);
  const [distances, setDistances] = useState<number[]>([])

  useEffect(() => {
    setPathLength(calculatePathLength(markers));
    setDistances(calculateDistances(markers));
  }, [markers]);

  async function lookup(postCode: string) {
    console.log("Looking up", postCode);
    const response = await fetch(`https://api.postcodes.io/postcodes/${postCode}`);
    var data = await response.json();
    if (data.status === 200 || data.status === 304) {
      setPosition([
        data.result.latitude,
        data.result.longitude
      ]);
      if (!started) setStarted(true)
    } else {
      alert("Invalid Post Code. Please try again.")
    }
  }



  return (
    <Box sx={{ width: "100%", display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      {!started && <>
        <Typography variant="h4">
          {user
            ? "Welcome back, " + user?.name + "!"
            : "Welcome guest!"
          }
        </Typography>
        <Typography variant="body1" width="50%" textAlign="center">
          Enter a post code and click "Start" to start plotting your route.
          {!user && <><br /><br /> You are currently not logged in, your routes will not be saved. To save your routes, please log in or create an account.</>}
        </Typography>
      </>}
      <Box sx={{ width: "100%", display: 'flex', justifyContent: 'center', gap: 2 }}>
        <TextField variant="outlined" value={postCode} onChange={event => setPostCode(event.target.value)} />
        <Button variant="contained" onClick={() => lookup(postCode)}>{started ? "Lookup" : "Start"}</Button>
      </Box>
      {started && <Map center={position} markers={markers} setMarkers={setMarkers} />}
      {/* {
        false && <LineChart
          xAxis={[{ data: distances, label: "Distance (km)" }]}
          yAxis={[{ label: "Elevation (m)" }]}
          series={[{
            data: markers.map(m => m.elevation),
            showMark: true,
          }]}
          onHighlightedAxisChange={event => {
            console.log(event);
            setMarkers(prev => {
              const newMarkers = prev.map((m, i) => ({
                ...m,
                highlight: i === event[0]?.dataIndex
              }));
              return newMarkers;
            });
          }}
          height={500}
          width={800} />
      } */}

    </Box >
  )
}