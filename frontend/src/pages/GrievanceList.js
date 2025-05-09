import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid,
  TextField,
  MenuItem,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Pagination,
  Card,
  CardContent,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { format } from 'date-fns';
import axios from 'axios';

const GrievanceList = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priority: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const categories = [
    'All',
    'Pension',
    'Healthcare',
    'Education',
    'Infrastructure',
    'Public Services',
    'Other'
  ];
  
  const statuses = [
    'All',
    'Pending',
    'In Progress',
    'Resolved',
    'Rejected'
  ];
  
  const priorities = [
    'All',
    'Low',
    'Medium',
    'High',
    'Urgent'
  ];
  
  useEffect(() => {
    fetchGrievances();
  }, [filters, page]);
  
  const fetchGrievances = async () => {
    setLoading(true);
    
    try {
      // Prepare query parameters
      const params = {
        page,
        limit: 10
      };
      
      if (filters.category && filters.category !== 'All') {
        params.category = filters.category;
      }
      
      if (filters.status && filters.status !== 'All') {
        params.status = filters.status;
      }
      
      if (filters.priority && filters.priority !== 'All') {
        params.priority = filters.priority;
      }
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      const response = await axios.get('/api/grievances', { params });
      
      setGrievances(response.data);
      
      // Calculate total pages (assuming the API returns total count in headers)
      const totalCount = parseInt(response.headers['x-total-count'] || '0', 10);
      setTotalPages(Math.ceil(totalCount / 10) || 1);
    } catch (error) {
      console.error('Error fetching grievances:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(1); // Reset to first page when filters change
  };
  
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
    setPage(1); // Reset to first page when search changes
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleClearFilters = () => {
    setFilters({
      category: '',
      status: '',
      priority: '',
      search: ''
    });
    setPage(1);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return { bg: '#e8f5e9', color: '#4caf50' };
      case 'Rejected':
        return { bg: '#ffebee', color: '#f44336' };
      case 'In Progress':
        return { bg: '#e3f2fd', color: '#1976d2' };
      default:
        return { bg: '#fff8e1', color: '#ff9800' };
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return { bg: '#ffebee', color: '#f44336' };
      case 'High':
        return { bg: '#fff8e1', color: '#ff9800' };
      case 'Medium':
        return { bg: '#e3f2fd', color: '#1976d2' };
      default:
        return { bg: '#e8f5e9', color: '#4caf50' };
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Grievances
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          component={RouterLink}
          to="/grievances/new"
        >
          File New Grievance
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search grievances..."
              value={filters.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 1 }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {showFilters && (
              <Button variant="outlined" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Grid>
        </Grid>
        
        {showFilters && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category === 'All' ? '' : category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status === 'All' ? '' : status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority === 'All' ? '' : priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : grievances.length > 0 ? (
        <>
          {grievances.map((grievance) => {
            const statusStyle = getStatusColor(grievance.status);
            const priorityStyle = getPriorityColor(grievance.priority);
            
            return (
              <Card key={grievance._id} sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography 
                        variant="h6" 
                        component={RouterLink} 
                        to={`/grievances/${grievance._id}`}
                        sx={{ 
                          textDecoration: 'none', 
                          color: 'primary.main',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {grievance.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {grievance.description.length > 150 
                          ? `${grievance.description.substring(0, 150)}...` 
                          : grievance.description}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Status:
                          </Typography>
                          <Chip 
                            label={grievance.status} 
                            size="small"
                            sx={{ 
                              bgcolor: statusStyle.bg, 
                              color: statusStyle.color,
                              fontWeight: 'medium'
                            }} 
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Priority:
                          </Typography>
                          <Chip 
                            label={grievance.priority} 
                            size="small"
                            sx={{ 
                              bgcolor: priorityStyle.bg, 
                              color: priorityStyle.color,
                              fontWeight: 'medium'
                            }} 
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Category:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {grievance.category}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Date:
                          </Typography>
                          <Typography variant="body2">
                            {format(new Date(grievance.createdAt), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      ) : (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No grievances found
          </Typography>
          <Typography variant="body1" paragraph>
            {filters.search || filters.category || filters.status || filters.priority 
              ? 'Try adjusting your filters or search terms'
              : 'You have not filed any grievances yet'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            component={RouterLink}
            to="/grievances/new"
            sx={{ mt: 2 }}
          >
            File Your First Grievance
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default GrievanceList;
