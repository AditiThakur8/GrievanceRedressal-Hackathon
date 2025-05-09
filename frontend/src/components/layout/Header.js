import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar, 
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span role="img" aria-label="logo" style={{ marginRight: '8px', fontSize: '1.5rem' }}>
            🏛️
          </span>
          CitizenVoice
        </Typography>
        
        {isMobile ? (
          <>
            <IconButton 
              color="inherit" 
              edge="end" 
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchorEl}
              open={Boolean(mobileMenuAnchorEl)}
              onClose={handleMobileMenuClose}
            >
              {isAuthenticated ? (
                <>
                  <MenuItem 
                    component={RouterLink} 
                    to="/dashboard" 
                    onClick={handleMobileMenuClose}
                  >
                    Dashboard
                  </MenuItem>
                  <MenuItem 
                    component={RouterLink} 
                    to="/grievances" 
                    onClick={handleMobileMenuClose}
                  >
                    My Grievances
                  </MenuItem>
                  <MenuItem 
                    component={RouterLink} 
                    to="/grievances/new" 
                    onClick={handleMobileMenuClose}
                  >
                    File Grievance
                  </MenuItem>
                  <MenuItem 
                    component={RouterLink} 
                    to="/profile" 
                    onClick={handleMobileMenuClose}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem onClick={() => { handleLogout(); handleMobileMenuClose(); }}>
                    Logout
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem 
                    component={RouterLink} 
                    to="/login" 
                    onClick={handleMobileMenuClose}
                  >
                    Login
                  </MenuItem>
                  <MenuItem 
                    component={RouterLink} 
                    to="/register" 
                    onClick={handleMobileMenuClose}
                  >
                    Register
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/dashboard"
                >
                  Dashboard
                </Button>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/grievances"
                >
                  My Grievances
                </Button>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/grievances/new"
                  variant="outlined"
                  sx={{ mx: 1 }}
                >
                  File Grievance
                </Button>
                <IconButton 
                  color="inherit" 
                  onClick={handleMenuOpen}
                  sx={{ ml: 1 }}
                >
                  {user?.profilePicture ? (
                    <Avatar 
                      src={user.profilePicture} 
                      alt={user.name} 
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircleIcon />
                  )}
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem 
                    component={RouterLink} 
                    to="/profile" 
                    onClick={handleMenuClose}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                >
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/register"
                  variant="outlined"
                  sx={{ ml: 1 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
