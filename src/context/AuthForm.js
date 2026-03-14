import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, TextField, Typography, Box, Alert } from '@mui/material';

const AuthForm = ({ isSignUp = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess('Registration successful! Please log in.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      let message = 'Error: ' + err.message;
      if (err.code === 'auth/wrong-password') message = 'Incorrect password';
      if (err.code === 'auth/user-not-found') message = 'User not found';
      if (err.code === 'auth/email-already-in-use') message = 'Email already in use';
      if (err.code === 'auth/weak-password') message = 'Password should be at least 6 characters';
      if (err.code === 'auth/invalid-email') message = 'Invalid email address';

      setError(message);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email to reset password');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Virtual Health Companion
      </Typography>
      <Typography variant="h6" align="center" gutterBottom>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          disabled={success && isSignUp}
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
      </form>

      {!isSignUp && (
        <Button fullWidth onClick={handleReset} sx={{ mb: 2 }}>
          Forgot Password?
        </Button>
      )}

      <Typography align="center">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Button href={isSignUp ? '/login' : '/register'}>
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </Button>
      </Typography>
    </Box>
  );
};

export default AuthForm;