import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid,
  Chip,
  Button,
  Divider,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GrievanceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchGrievanceDetails();
  }, [id]);
  
  const fetchGrievanceDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`/api/grievances/${id}`);
      setGrievance(response.data);
    } catch (error) {
      console.error('Error fetching grievance details:', error);
      setError('Failed to load grievance details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    setSubmittingComment(true);
    
    try {
      const response = await axios.post(`/api/grievances/${id}/comments`, {
        text: comment
      });
      
      // Update grievance with new comment
      setGrievance({
        ...grievance,
        comments: [...grievance.comments, response.data]
      });
      
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
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
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/grievances')}
            sx={{ mt: 2 }}
          >
            Back to Grievances
          </Button>
        </Paper>
      </Container>
    );
  }
  
  if (!grievance) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Grievance not found
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/grievances')}
            sx={{ mt: 2 }}
          >
            Back to Grievances
          </Button>
        </Paper>
      </Container>
    );
  }
  
  const statusStyle = getStatusColor(grievance.status);
  const priorityStyle = getPriorityColor(grievance.priority);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/grievances')}
        >
          Back to Grievances
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {grievance.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <Chip 
                label={`Status: ${grievance.status}`} 
                sx={{ 
                  bgcolor: statusStyle.bg, 
                  color: statusStyle.color,
                  fontWeight: 'medium'
                }} 
              />
              <Chip 
                label={`Priority: ${grievance.priority}`} 
                sx={{ 
                  bgcolor: priorityStyle.bg, 
                  color: priorityStyle.color,
                  fontWeight: 'medium'
                }} 
              />
              <Chip label={`Category: ${grievance.category}`} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Grievance ID: {grievance._id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filed on: {format(new Date(grievance.createdAt), 'MMMM dd, yyyy')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {format(new Date(grievance.updatedAt), 'MMMM dd, yyyy')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {grievance.description}
        </Typography>
        
        {grievance.location?.address && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Location
            </Typography>
            <Typography variant="body1">
              {grievance.location.address}
            </Typography>
          </>
        )}
        
        {grievance.attachments && grievance.attachments.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Attachments
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {grievance.attachments.map((attachment, index) => (
                <Chip
                  key={index}
                  icon={<AttachFileIcon />}
                  label={`Attachment ${index + 1}`}
                  component="a"
                  href={attachment}
                  target="_blank"
                  clickable
                />
              ))}
            </Box>
          </>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments and Updates
        </Typography>
        
        {grievance.comments && grievance.comments.length > 0 ? (
          <List>
            {grievance.comments.map((comment, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar>
                      <AccountCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1">
                          {comment.user?.name || 'User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(comment.createdAt), 'MMM dd, yyyy h:mm a')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body1"
                        color="text.primary"
                        sx={{ mt: 1, whiteSpace: 'pre-line' }}
                      >
                        {comment.text}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < grievance.comments.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No comments yet.
          </Typography>
        )}
        
        <Box component="form" onSubmit={handleSubmitComment} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Add a comment"
            multiline
            rows={3}
            value={comment}
            onChange={handleCommentChange}
            placeholder="Type your comment or question here..."
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={!comment.trim() || submittingComment}
            >
              {submittingComment ? <CircularProgress size={24} /> : 'Post Comment'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {user?.role === 'admin' || user?.role === 'official' ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Administrative Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => {
                  // Handle assign action
                }}
              >
                Assign Grievance
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                color="success"
                onClick={() => {
                  // Handle resolve action
                }}
              >
                Mark as Resolved
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                onClick={() => {
                  // Handle in progress action
                }}
              >
                Mark as In Progress
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => {
                  // Handle reject action
                }}
              >
                Reject Grievance
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : null}
    </Container>
  );
};

export default GrievanceDetails;
