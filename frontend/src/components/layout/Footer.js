import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        mt: 'auto',
        backgroundColor: 'primary.main',
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              <span role="img" aria-label="logo" style={{ marginRight: '8px' }}>
                🏛️
              </span>
              CitizenVoice
            </Typography>
            <Typography variant="body2">
              Empowering citizens through effective grievance redressal
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Home
            </Link>
            <Link href="/grievances/new" color="inherit" sx={{ display: 'block', mb: 1 }}>
              File a Grievance
            </Link>
            <Link href="/login" color="inherit" sx={{ display: 'block' }}>
              Login/Register
            </Link>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Resources
            </Typography>
            <Link href="#" color="inherit" sx={{ display: 'block', mb: 1 }}>
              FAQ
            </Link>
            <Link href="#" color="inherit" sx={{ display: 'block', mb: 1 }}>
              User Guide
            </Link>
            <Link href="#" color="inherit" sx={{ display: 'block' }}>
              Contact Support
            </Link>
          </Box>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            © {currentYear} CitizenVoice Grievance Redressal System. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
