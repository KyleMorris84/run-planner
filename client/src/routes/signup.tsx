import { apiFetch } from '@/utilities/apiClient'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { Eye, EyeClosed, Lock, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 8 characters long'),
})

type SignUpFormData = z.infer<typeof signUpSchema>

function RouteComponent() {
  const [viewPassword, setViewPassword] = useState<boolean>(false)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) });

  const toggleViewPassword = () => {
    setViewPassword((prev) => !prev)
  }

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    try {
      var response = await apiFetch('register', { method: 'POST', body: JSON.stringify(data) }, false);
    } catch (error: any) {
      setError('root', { message: error.message ?? 'An error occurred during sign up' });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Paper className="flex flex-col items-center justify-center gap-8 p-10 mt-10 bg-gray-50 w-95">
        <Typography variant="h5">Sign Up</Typography>
        <TextField
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name ? errors.name.message : ''}
          variant="outlined"
          label="Name"
          name="name"
          type="text"
          fullWidth={true}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <UserRound size={20} />
                </InputAdornment>
              )
            }
          }}
        />
        <TextField
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email ? errors.email.message : ''}
          variant="outlined"
          label="Email"
          name="email"
          type="email"
          fullWidth={true}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={20} />
                </InputAdornment>
              )
            }
          }}
        />
        <TextField
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password ? errors.password.message : ''}
          variant="outlined"
          label="Password"
          name="password"
          type={viewPassword ? 'text' : 'password'}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleViewPassword}
                  >
                    {viewPassword ? <EyeClosed /> : <Eye />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />
        <Button disabled={isSubmitting} variant="contained" color="primary" fullWidth={true} type="submit">
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
        {errors.root && (<Typography variant="body2" color="error">{errors.root.message}</Typography>)}
        {isSubmitSuccessful && !errors.root && (<Typography variant="body2" color="success">Sign up successful!</Typography>)}
      </Paper>
    </form>
  )
}
