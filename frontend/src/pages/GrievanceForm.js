import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Box, 
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GrievanceForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    location: {
      address: ''
    }
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');
  
  const navigate = useNavigate();
  
  const categories = [
    'Pension',
    'Healthcare',
    'Education',
    'Infrastructure',
    'Public Services',
    'Other'
  ];
  
  const priorities = [
    'Low',
    'Medium',
    'High',
    'Urgent'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'address') {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          address: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    setAlertMessage('');
    
    try {
      // Create form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('location', JSON.stringify(formData.location));
      
      // Append files if any
      files.forEach(file => {
        formDataToSend.append('attachments', file);
      });
      
      // Submit grievance
      const response = await axios.post('/api/grievances', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setAlertSeverity('success');
      setAlertMessage('Grievance submitted successfully!');
      
      // Redirect to grievance details page after a short delay
      setTimeout(() => {
        navigate(`/grievances/${response.data._id}`);
      }, 1500);
    } catch (error) {
      setAlertSeverity('error');
      setAlertMessage(error.response?.data?.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          File a Grievance
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Please provide detailed information about your grievance to help us address it efficiently.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        {alertMessage && (
          <Alert severity={alertSeverity} sx={{ mb: 3 }}>
            {alertMessage}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                name="title"
                label="Grievance Title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.category}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error">
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  label="Priority"
                  onChange={handleChange}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Location/Address (Optional)"
                value={formData.location.address}
                onChange={handleChange}
                placeholder="Enter the location related to your grievance"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="description"
                name="description"
                label="Detailed Description"
                multiline
                rows={6}
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Please provide a detailed description of your grievance, including relevant dates, people involved, and any previous attempts to resolve the issue."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Supporting Documents (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                You can upload up to 5 files (max 5MB each). Accepted formats: JPG, PNG, PDF, DOC, DOCX.
              </Typography>
              <Button
                variant="outlined"
                component="label"
                sx={{ mr: 2 }}
              >
                Select Files
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  hidden
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
              </Button>
              <Typography variant="body2" component="span">
                {files.length > 0 ? `${files.length} file(s) selected` : 'No files selected'}
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Submit Grievance
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default GrievanceForm;
