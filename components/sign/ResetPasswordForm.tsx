'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ResetPasswordFormProps {
  email: string;
  code: string;
  onSuccess: () => void;
  onClose: () => void;
}

const ResetPasswordForm = ({ email, code, onSuccess, onClose }: ResetPasswordFormProps) => {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      new_password: '',
      confirm_password: '',
    },
    validationSchema: Yup.object({
      new_password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        )
        .required('Required'),
      confirm_password: Yup.string()
        .oneOf([Yup.ref('new_password')], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/users/password-reset/confirm/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code,
            new_password: values.new_password,
            confirm_password: values.confirm_password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          onSuccess();
        } else {
          toast.error(data.message || 'Failed to reset password');
        }
      } catch (error) {
        toast.error('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        width: '90%',
        maxWidth: 400,
        bgcolor: '#fff',
        borderRadius: 1,
        p: 4,
        color: '#1B4242',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#5C8374',
          '&:hover': {
            color: '#1B4242',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Typography
        variant="h5"
        component="h2"
        align="center"
        sx={{ mb: 3, color: '#1B4242' }}
      >
        Reset Password
      </Typography>

      <Typography
        variant="body1"
        align="center"
        sx={{ mb: 4, color: '#5C8374' }}
      >
        Please enter your new password
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          type="password"
          id="new_password"
          name="new_password"
          label="New Password"
          value={formik.values.new_password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.new_password && Boolean(formik.errors.new_password)}
          helperText={formik.touched.new_password && formik.errors.new_password}
          required
          variant="outlined"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              color: '#1B4242',
              '& fieldset': {
                borderColor: '#5C8374',
              },
              '&:hover fieldset': {
                borderColor: '#1B4242',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1B4242',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#5C8374',
            },
            '& .MuiFormHelperText-root': {
              color: '#f44336',
            },
          }}
        />

        <TextField
          fullWidth
          type="password"
          id="confirm_password"
          name="confirm_password"
          label="Confirm Password"
          value={formik.values.confirm_password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
          helperText={formik.touched.confirm_password && formik.errors.confirm_password}
          required
          variant="outlined"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              color: '#1B4242',
              '& fieldset': {
                borderColor: '#5C8374',
              },
              '&:hover fieldset': {
                borderColor: '#1B4242',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1B4242',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#5C8374',
            },
            '& .MuiFormHelperText-root': {
              color: '#f44336',
            },
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || !formik.isValid}
          sx={{
            bgcolor: '#42B7B0',
            color: '#fff',
            '&:hover': {
              bgcolor: '#3AA19B',
            },
            '&.Mui-disabled': {
              bgcolor: '#A5D3D1',
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
        </Button>
      </form>
    </Box>
  );
};

export default ResetPasswordForm;
