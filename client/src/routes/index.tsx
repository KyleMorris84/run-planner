import type { User } from '@/types/User';
import { Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { getCookie } from '@/utilities/cookieManagement';

export const Route = createFileRoute('/')({
  component: Index
})
function Index() {

  const user = getCookie<User>('user');

  return (
    <div className="flex flex-col items-center justify-center mt-16">
      <Typography variant="h4">
        {user ? `Welcome, ${user.name}!` : 'Welcome to my app!'}
      </Typography>

      <Typography variant="body1" className="mt-10">
        {user ? "You are logged in" : "You are not logged in"}
      </Typography>
    </div >
  )
}