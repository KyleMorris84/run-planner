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



  if (started) {
    return (
      <div className="h-full">
        <Map center={position} markers={markers} setMarkers={setMarkers} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center mt-16">
      <Typography variant="h4">
        {user ? `Welcome back, ${user.name}!` : "Welcome guest!"}
      </Typography>
      <Typography variant="body1" width="50%" textAlign="center" mt={5}>
        Enter a post code and click "Start" to start plotting your route.
        {!user && <><br /><br />You are currently not logged in — your routes will not be saved. Please log in or create an account to save them.</>}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 5 }}>
        <TextField variant="outlined" value={postCode} onChange={event => setPostCode(event.target.value)} />
        <Button variant="contained" onClick={() => lookup(postCode)}>Start</Button>
      </Box>
    </div>
  )
}