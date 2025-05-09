import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const drawerWidth = 240;
  
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      text: 'My Grievances',
      icon: <ListAltIcon />,
      path: '/grievances'
    },
    {
      text: 'File Grievance',
      icon: <AddCircleOutlineIcon />,
      path: '/grievances/new'
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/profile'
    }
  ];
  
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (user?.role === 'admin' || user?.role === 'official') {
      return true;
    }
    // For regular citizens, show all items
    return true;
  });
  
  if (isMobile) {
    return null; // Don't render sidebar on mobile, we use the header menu instead
  }
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e0e0e0'
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          <span role="img" aria-label="logo" style={{ marginRight: '8px' }}>
            🏛️
          </span>
          CitizenVoice
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {user?.role === 'admin' ? 'Admin Panel' : 
           user?.role === 'official' ? 'Official Dashboard' : 
           'Citizen Portal'}
        </Typography>
      </Box>
      
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: '8px',
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? 'primary.main' : 'inherit',
              minWidth: '40px'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 'bold' : 'normal'
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Logged in as:
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {user?.name || 'Guest'}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
