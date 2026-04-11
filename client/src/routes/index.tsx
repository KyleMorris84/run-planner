import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import Map from '@/components/Map';
import type { Coordinate } from '@/types/Map';

export const Route = createFileRoute('/')({
  component: Index
})

function Index() {
  const [position, setPosition] = useState<Coordinate>([53.818235, -1.576158])

  async function lookup(postCode: string) {
    const response = await fetch(`https://api.postcodes.io/postcodes/${postCode}`);
    const data = await response.json();
    if (data.status === 200 || data.status === 304) {
      setPosition([data.result.latitude, data.result.longitude]);
    } else {
      alert("Invalid postcode. Please try again.")
    }
  }

  return (
    <div className="h-full">
      <Map center={position} onSearch={lookup} />
    </div>
  )
}
