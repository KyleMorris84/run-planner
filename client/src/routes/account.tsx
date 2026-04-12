import type { RegisterResponse } from '@/types/RegisterResponse'
import type { AccessToken } from '@/types/Tokens'
import type { User } from '@/types/User'
import { apiFetch } from '@/utilities/apiClient'
import { getCookie, setCookie } from '@/utilities/cookieManagement'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Divider, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { Mail, Pencil, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/account')({
  component: RouteComponent,
})

const updateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
})

type FormFields = z.infer<typeof updateSchema>

function RouteComponent() {
  const [user, setUser] = useState<User | null>(getCookie<User>('user'))
  const [isEditing, setIsEditing] = useState(false)

  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<FormFields>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  })

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const updated = await apiFetch<RegisterResponse>('me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })

      const updatedUser = { ...user, name: updated.name, email: updated.email } as User
      setCookie('user', updatedUser)
      setUser(updatedUser)

      const refreshed = await apiFetch<AccessToken>('refresh', { method: 'POST' }, false)
      setCookie('accessToken', { token: refreshed.token, exp: refreshed.exp } as AccessToken)
      setCookie('refreshTokenExpiry', refreshed.refreshTokenExp)

      setIsEditing(false)
    } catch (error: any) {
      setError('root', { message: error.message ?? 'Update failed. Please try again.' })
    }
  }

  const handleCancel = () => {
    reset({ name: user?.name ?? '', email: user?.email ?? '' })
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col items-center justify-center mt-16 select-text">
      <Typography variant="h4">My Account</Typography>

      {!isEditing ? (
        <Paper className="flex flex-col gap-4 p-10 mt-10 bg-gray-50 w-[500px]">
          <div className="flex flex-col gap-1">
            <Typography variant="caption" className="text-gray-500 uppercase tracking-wide">Name</Typography>
            <Typography variant="body1">{user?.name ?? '—'}</Typography>
          </div>
          <Divider />
          <div className="flex flex-col gap-1">
            <Typography variant="caption" className="text-gray-500 uppercase tracking-wide">Email</Typography>
            <Typography variant="body1">{user?.email ?? '—'}</Typography>
          </div>
          <Divider />
          <div className="flex flex-col gap-1">
            <Typography variant="caption" className="text-gray-500 uppercase tracking-wide">Role</Typography>
            <Typography variant="body1">{user?.role ?? '—'}</Typography>
          </div>
          <Button
            variant="outlined"
            startIcon={<Pencil size={16} />}
            className="mt-4"
            onClick={() => setIsEditing(true)}
          >
            Edit Account Details
          </Button>
        </Paper>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper className="flex flex-col items-center gap-6 p-10 mt-10 bg-gray-50 w-[500px]">
            <TextField
              {...register('name')}
              label="Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <UserRound size={20} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {errors.root && (
              <Typography variant="body2" color="error">{errors.root.message}</Typography>
            )}
            {isSubmitSuccessful && !errors.root && (
              <Typography variant="body2" color="success">Details updated successfully.</Typography>
            )}
            <div className="flex gap-3 w-full">
              <Button variant="outlined" fullWidth onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="contained" fullWidth type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Paper>
        </form>
      )}
    </div>
  )
}
