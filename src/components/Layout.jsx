import  { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const drawerWidth = 256;

const Layout = ({ children, activePage, setActivePage, isDark, toggleTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'transactions', label: 'Transactions', icon: ReceiptLongIcon },
    { id: 'payments', label: 'Payments (Checkout)', icon: PaymentIcon },
    { id: 'customers', label: 'Customers', icon: PeopleIcon },
    { id: 'reports', label: 'Reports', icon: AssessmentIcon },
    { id: 'webhooks', label: 'Webhooks', icon: LanguageIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileOpen(false);
  };


  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
     
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: 80, px: 3, borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bg: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)', color: '#ffffff', fontWeight: 'extrabold', fontSize: '18px' }} className="select-none" >
          A
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2, bg: isDark ? 'linear-gradient(90deg, #ffffff 0%, #94a3b8 100%)' : 'linear-gradient(90deg, #0f172a 0%, #475569 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AXIPAYS
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '2px', color: '#06B6D4', display: 'block' }}>
            FINTECH
          </Typography>
        </Box>
      </Box>

 
      <Box sx={{ flexGrow: 1, px: 2, py: 3, display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto',marginBottom:'50px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (item.id === 'dashboard' && activePage === 'transactions');
          return (
            <Button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              variant="text"
              sx={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.5,
                borderRadius: '12px',
                color: isActive ? '#3B82F6' : (isDark ? '#94A3B8' : '#475569'),
                bgcolor: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                  color: isDark ? '#ffffff' : '#0f172a',
                },
                position: 'relative',
              }}
            >
              {isActive && (
                <Box sx={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: '3px', bgcolor: '#3B82F6', borderRadius: '0 4px 4px 0' }} />
              )}
              <Icon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 500, fontSize: '13px' }}>
                {item.label}
              </Typography>
            </Button>
          );
        })}
      </Box>

    
      <Box sx={{ p: 2, borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Button
          onClick={() => handleNavClick('logout')}
          variant="text"
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            gap: 2,
            px: 2,
            py: 1.5,
            borderRadius: '12px',
            color: '#94A3B8',
            '&:hover': {
              bgcolor: 'rgba(244, 63, 94, 0.08)',
              color: '#f87171',
            },
          }}
        >
          <ExitToAppIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
            Logout
          </Typography>
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      
     
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', bg: 'rgba(37, 99, 235, 0.06)', filter: 'blur(120px)' }} className="animate-float" />
        <Box sx={{ position: 'absolute', bottom: '15%', right: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', bg: 'rgba(6, 182, 212, 0.06)', filter: 'blur(100px)' }} className="animate-float" style={{ animationDelay: '-3s' }} />
      </Box>

  
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: isDark ? 'rgba(5, 8, 22, 0.7)' : 'rgba(248, 250, 252, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          color: isDark ? '#ffffff' : '#0f172a',
          zIndex: 40,
        }}
      >
        <Toolbar sx={{ height: 80, px: { xs: 3, md: 4 }, display: 'flex', justifyContent: 'space-between' }}>
          
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                {activePage === 'dashboard' ? 'Analytics Dashboard' : 
                 activePage === 'transactions' ? 'Transaction History' : 
                 activePage === 'payments' ? 'Secure Checkout' : 
                 activePage.charAt(0).toUpperCase() + activePage.slice(1)}
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#475569', display: { xs: 'none', sm: 'block' } }}>
                Welcome back, Administrator
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
           
            <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton 
                onClick={toggleTheme} 
                sx={{ 
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  p: 1.2,
                  color: isDark ? '#f59e0b' : '#3B82F6',
                  '&:hover': { bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
                }}
              >
                {isDark ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>

            
            <Tooltip title="Notifications">
              <IconButton 
                sx={{ 
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  p: 1.2,
                  color: isDark ? '#94A3B8' : '#475569',
                  '&:hover': { bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }
                }}
              >
                <Badge variant="dot" color="primary" overlap="circular" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                  <NotificationsIcon sx={{ fontSize: 18 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Box sx={{ height: 32, width: '1px', bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', mx: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 3, bg: 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold', fontSize: '13px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                AD
              </Box>
              <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '12px' }}>Alex Danvers</Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#475569', display: 'block', fontSize: '9px', fontWeight: 'bold' }}>MERCHANT ADMIN</Typography>
              </Box>
            </Box>

          </Box>
        </Toolbar>
      </AppBar>

     
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, zIndex: 40 }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} 
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              bgcolor: isDark ? 'rgba(11, 16, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
              backgroundImage: 'none',
            },
          }}
        >
         
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5 }}>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          {sidebarContent}
        </Drawer>

       
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: isDark ? 'rgba(11, 16, 35, 0.6)' : 'rgba(255, 255, 255, 0.6)',
              borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
              backgroundImage: 'none',
            },
          }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

     
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 3, md: 4 },
          pt: 13, // Padding top accounts for AppBar height
          zIndex: 10,
          position: 'relative',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
