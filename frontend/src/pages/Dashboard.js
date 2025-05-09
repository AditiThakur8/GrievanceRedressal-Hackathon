import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Paper,
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  });
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch grievance statistics
        const statsResponse = await axios.get('/api/grievances/stats/summary');
        
        // Fetch recent grievances
        const grievancesResponse = await axios.get('/api/grievances', {
          params: {
            limit: 5,
            sort: '-createdAt'
          }
        });
        
        setStats(statsResponse.data);
        setRecentGrievances(grievancesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Welcome back, {user?.name}! Here's an overview of your grievances.
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Grievances filed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff8e1' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PendingActionsIcon sx={{ color: '#ff9800', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color="#ff9800">
                {stats.statusDistribution?.pending || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting action
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Resolved
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color="#4caf50">
                {stats.statusDistribution?.resolved || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Successfully completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffebee' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CancelIcon sx={{ color: '#f44336', mr: 1 }} />
                <Typography variant="h6" component="div">
                  Rejected
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color="#f44336">
                {stats.statusDistribution?.rejected || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Not approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent Grievances */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Recent Grievances
          </Typography>
          <Button 
            variant="outlined" 
            component={RouterLink} 
            to="/grievances"
          >
            View All
          </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {recentGrievances.length > 0 ? (
          recentGrievances.map((grievance, index) => (
            <Box key={grievance._id}>
              <Grid container spacing={2} sx={{ py: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" component={RouterLink} to={`/grievances/${grievance._id}`} sx={{ textDecoration: 'none', color: 'primary.main' }}>
                    {grievance.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {grievance.description.substring(0, 100)}...
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {grievance.category}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ 
                    display: 'inline-block', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1,
                    bgcolor: 
                      grievance.status === 'Resolved' ? '#e8f5e9' : 
                      grievance.status === 'Rejected' ? '#ffebee' : 
                      grievance.status === 'In Progress' ? '#e3f2fd' : '#fff8e1',
                    color: 
                      grievance.status === 'Resolved' ? '#4caf50' : 
                      grievance.status === 'Rejected' ? '#f44336' : 
                      grievance.status === 'In Progress' ? '#1976d2' : '#ff9800'
                  }}>
                    <Typography variant="body2">
                      {grievance.status}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {index < recentGrievances.length - 1 && <Divider />}
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.secondary">
              You haven't filed any grievances yet.
            </Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/grievances/new"
              sx={{ mt: 2 }}
            >
              File a Grievance
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Quick Actions
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button 
              fullWidth 
              variant="contained" 
              component={RouterLink} 
              to="/grievances/new"
              sx={{ py: 2 }}
            >
              File New Grievance
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              fullWidth 
              variant="outlined" 
              component={RouterLink} 
              to="/grievances"
              sx={{ py: 2 }}
            >
              View All Grievances
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              fullWidth 
              variant="outlined" 
              component={RouterLink} 
              to="/profile"
              sx={{ py: 2 }}
            >
              Update Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Dashboard;
