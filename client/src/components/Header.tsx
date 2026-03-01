import { Link } from '@tanstack/react-router'
import { Home } from 'lucide-react'
import UserIconButton from './UserIconButton'

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-blue-950 text-white shadow-lg">
      <Link to='/'>
        <div className="flex items-center">
          <Home size={24} />
          <h1 className="ml-4 text-xl font-semibold pb-1">My App</h1>
        </div>
      </Link>
      <UserIconButton />
    </header>
  )
}
