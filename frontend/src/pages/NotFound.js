import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 5 }}>
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404 - Page Not Found
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/"
            size="large"
            sx={{ mx: 1 }}
          >
            Go to Homepage
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/grievances"
            size="large"
            sx={{ mx: 1 }}
          >
            View Grievances
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;
