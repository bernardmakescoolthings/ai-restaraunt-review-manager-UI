import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, Container, Paper } from '@mui/material';

const BusinessUrlForm = () => {
  const [businessUrl, setBusinessUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews/fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ business_url: businessUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch business data');
      }

      const data = await response.json();
      // Store the data in localStorage for the table page to use
      localStorage.setItem('businessData', JSON.stringify(data));
      navigate('/business-table');
    } catch (err) {
      setError('Failed to fetch business data. Please check the URL and try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Enter Business URL
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Business URL"
              variant="outlined"
              value={businessUrl}
              onChange={(e) => setBusinessUrl(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
            >
              Fetch Reviews
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default BusinessUrlForm; 