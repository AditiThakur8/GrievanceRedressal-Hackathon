import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Box,
  Paper
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Home = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Paper 
        sx={{ 
          py: 8, 
          backgroundColor: 'primary.main', 
          color: 'white',
          borderRadius: 0
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom>
                Citizen Grievance Redressal System
              </Typography>
              <Typography variant="h6" paragraph>
                A transparent and efficient platform to address your concerns and ensure your voice is heard.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  component={RouterLink}
                  to="/grievances/new"
                  sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
                >
                  File a Grievance
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  component={RouterLink}
                  to="/register"
                >
                  Register
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '300px',
                  width: '100%'
                }}
              >
                <img 
                  src="/flag.png" 
                  alt="Grievance Redressal" 
                  style={{ 
                    width: 'auto',
                    height: '100%',
                    maxHeight: '300px'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>
      
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          How It Works
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Our platform makes it easy to file and track your grievances
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <HowToRegIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Register
                </Typography>
                <Typography align="center">
                  Create an account to access all features of the grievance portal.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Submit
                </Typography>
                <Typography align="center">
                  File your grievance with all relevant details and supporting documents.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <TrackChangesIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Track
                </Typography>
                <Typography align="center">
                  Monitor the status of your grievance in real-time through our transparent system.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <SupportAgentIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Resolve
                </Typography>
                <Typography align="center">
                  Get timely resolution and updates from concerned authorities.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Statistics Section */}
      <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Making an Impact
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" color="primary">
                  10,000+
                </Typography>
                <Typography variant="h6">
                  Grievances Filed
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" color="primary">
                  85%
                </Typography>
                <Typography variant="h6">
                  Resolution Rate
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h3" color="primary">
                  7 Days
                </Typography>
                <Typography variant="h6">
                  Average Resolution Time
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Join thousands of citizens who have successfully resolved their grievances through our platform.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          component={RouterLink}
          to="/register"
          sx={{ mt: 2 }}
        >
          Register Now
        </Button>
      </Container>
    </Box>
  );
};

export default Home;
