import type { User, UserResponse } from '@/types/User';
import { apiFetch } from '@/utilities/apiClient';
import { Button, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/account')({
  component: RouteComponent,
})

function RouteComponent() {
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);


  const getMe = async () => {
    try {
      var response = await apiFetch<UserResponse>('me');

      var userData: User = {
        id: response.sub,
        name: response.name,
        email: response.email,
        role: response.role
      }

      setMe(userData);
      setError(null);

    } catch (error: any) {

      setMe(null);
      setError(error.message);

    }
  }

  return (
    <div className="flex flex-col items-center justify-center mt-16">
      <Typography variant="h4">My Account</Typography>

      <Button variant="contained" className="mt-10" onClick={getMe}>/me</Button>

      {me &&
        <div className="flex flex-col items-start mt-4 bg-gray-100 p-4 rounded w-95">
          <Typography variant="body2" className="text-gray-500">Response:</Typography>
          {
            JSON.stringify(me, null, "\t")
              .split("\n")
              .map((line, index) => (
                <Typography
                  variant="body2"
                  className={`self-left text-gray-500 ${line == "{" || line == "}" ? "" : "pl-4"}`}
                  key={index}>
                  {line}
                </Typography>
              ))
          }
        </div>
      }

      {error &&
        <div className="flex flex-col items-start mt-4 bg-gray-100 p-4 rounded w-95">
          <Typography variant="body2" className="text-red-500">{error}</Typography>
        </div>
      }
    </div >
  )
}
