import { Button, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Eye, EyeClosed, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiFetch } from '@/utilities/apiClient'
import { setCookie } from '@/utilities/cookieManagement'
import type { User, UserResponse } from '@/types/User'
import type { AccessToken } from '@/types/Tokens'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

const loginSchema = z.object({
  email: z.email("Incorrect email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormFields = z.infer<typeof loginSchema>;

function RouteComponent() {
  const [viewPassword, setViewPassword] = useState<boolean>(false)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<FormFields>({ resolver: zodResolver(loginSchema) });

  const login = async ({ email, password }: { email: string; password: string }) => {

    var response = await apiFetch<AccessToken>(
      'login',
      { body: JSON.stringify({ email, password }), method: 'POST' },
      false
    ).catch((error) => {
      throw error;
    });

    setCookie('accessToken', { token: response.token, exp: response.exp } as AccessToken);
    setCookie('refreshTokenExpiry', response.refreshTokenExp);

    var user = await apiFetch<UserResponse>('me', { headers: { Authorization: `Bearer ${response.token}` } });
    setCookie(
      'user',
      {
        id: user.sub,
        name: user.name,
        email: user.email,
        role: user.role
      } as User
    );
  }

  const toggleViewPassword = () => {
    setViewPassword((prev) => !prev)
  }

  const onSubmit: SubmitHandler<FormFields> = async (data) => {

    try {
      await login({
        email: data.email,
        password: data.password
      });
      setTimeout(() => window.location.replace("/"), 1000);
    }
    catch (error: any) {
      console.error('Login failed:', error);
      setError('root', { message: 'Login failed. Please check your credentials and try again.' });
    }


  }

  return (
    <div className="flex flex-col items-center mt-16">
      <Typography variant="h4">Log In</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
      <Paper className="flex flex-col items-center justify-center gap-8 p-10 mt-10 bg-gray-50 w-[500px]">
        <TextField
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email && errors.email.message}
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
          helperText={errors.password && errors.password.message}
          variant="outlined"
          label="Password"
          name="password"
          fullWidth={true}
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
          {isSubmitting ? 'Logging In...' : 'Log In'}
        </Button>
        {!errors.root && !isSubmitSuccessful && (
          <Link to="/signup">
            <Typography variant="body2" color="textSecondary">Don't have an account? Sign up here.</Typography>
          </Link>
        )}
        {errors.root && (
          <Typography variant="body2" color="error">{errors.root.message}</Typography>
        )}
        {isSubmitSuccessful && !errors.root && (
          <Typography variant="body2" color="success">Login successful!</Typography>
        )}
      </Paper>
      </form>
    </div>
  )
}
