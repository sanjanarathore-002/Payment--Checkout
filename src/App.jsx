import  { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';


import ShieldIcon from '@mui/icons-material/Shield';
import TerminalIcon from '@mui/icons-material/Terminal';
import CompassIcon from '@mui/icons-material/Explore';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import Layout from './components/Layout';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import TransactionTable from './components/TransactionTable';

const App = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isDark, setIsDark] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.style.backgroundColor = '#050816';
      root.style.color = '#f8fafc';
    } else {
      root.style.backgroundColor = '#f8fafc';
      root.style.color = '#0f172a';
    }
  }, [isDark]);

 
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://payment-assignment.onrender.com/transactions?page=1&limit=500");
        const json = await response.json();
        if (json.status === 'Success' && Array.isArray(json.data)) {
        
          const sorted = json.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setTransactions(sorted);
        }
      } catch (err) {
        console.error("Error loading global transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const toggleTheme = () => setIsDark(!isDark);


  const muiTheme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#2563EB', 
      },
      secondary: {
        main: '#06B6D4', 
      },
      background: {
        default: isDark ? '#050816' : '#f8fafc',
        paper: isDark ? 'rgba(11, 16, 35, 0.65)' : 'rgba(255, 255, 255, 0.8)',
      },
      text: {
        primary: isDark ? '#FFFFFF' : '#0f172a',
        secondary: isDark ? '#94A3B8' : '#475569',
      },
    },
    typography: {
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.5s ease, color 0.5s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            padding: '10px 20px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: isDark ? 'rgba(7, 11, 25, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: '#3B82F6',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3B82F6',
                boxShadow: '0 0 12px rgba(59, 130, 246, 0.35)',
              },
            },
            '& .MuiInputLabel-root': {
              color: isDark ? '#94A3B8' : '#475569',
              fontSize: '14px',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#3B82F6',
            },
          },
        },
      },
    },
  });

  const renderComingSoon = (title, description, icon) => {
    const Icon = icon || CompassIcon;
    return (
      <Box className="glass-panel" sx={{ p: 6, borderRadius: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', my: 6, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 128, height: 128, bg: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', filter: 'blur(32px)', pointerEvents: 'none' }} />
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', mb: 3 }} className="animate-float">
          <Icon sx={{ fontSize: 32 }} />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#475569', lineHeight: 1.6, maxWidth: 360, mx: 'auto' }}>{description}</Typography>
        </Box>
        <Box sx={{ bgcolor: 'rgba(7, 11, 25, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: 450 }}>
          <TerminalIcon sx={{ color: '#22d3ee', fontSize: 20 }} />
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94A3B8', textAlign: 'left' }}>
            Status: Feature pending deployment to AXIPAYS production clusters.
          </Typography>
        </Box>
      </Box>
    );
  };

  
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard isDark={isDark} />;
      
      case 'transactions':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3,px: { xs: 2, md: 4 }, py: 4 ,pt:7}}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>All Transactions</Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#475569' }}>Search and audit the complete history of payments</Typography>
            </Box>
            <Box className="glass-panel" sx={{ p: 3, borderRadius: 4 }}>
              <TransactionTable 
                transactions={transactions}
                loading={loading}
                currentPage={1}
                setCurrentPage={() => {}}
                totalPages={1}
                isDark={isDark}
              />
            </Box>
          </Box>
        );

      case 'payments':
        return <Checkout />;

      case 'customers':
        return renderComingSoon(
          'Customer Directory', 
          'Manage your consumer profiles, check recurring billing models, monitor customer lifetime values, and view charge histories.',
          CompassIcon
        );

      case 'reports':
        return renderComingSoon(
          'Financial Reports', 
          'Download customized settlement records, export tax reconciliation balance sheets, and review daily/weekly payouts.',
          TerminalIcon
        );

      case 'webhooks':
        return renderComingSoon(
          'Developer Integrations', 
          'Register webhook listeners, check response payload logs, manage public/secret API keys, and review sandbox simulations.',
         
        );

      case 'settings':
        return renderComingSoon(
          'System Settings', 
          'Configure merchant credentials, select default settlement bank accounts, set routing rule priorities, and adjust security preferences.',
          ShieldIcon
        );

      case 'logout':
        return (
          <Box className="glass-panel" sx={{ borderRadius: 4, p: 6, textAlign: 'center', maxWidth: 400, mx: 'auto', my: 6, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', justify: 'center', color: '#f87171', mx: 'auto', mb: 2 }}>
              <WarningAmberIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Logged Out</Typography>
            <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#475569', display: 'block', mb: 3 }}>You have been logged out of the merchant center console.</Typography>
            <Button 
              variant="contained"
              onClick={() => setActivePage('dashboard')}
              sx={{ py: 1, px: 4, fontSize: '12px' }}
            >
              Sign In Again
            </Button>
          </Box>
        );

      default:
        return <Dashboard isDark={isDark} />;
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Layout 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isDark={isDark} 
        toggleTheme={toggleTheme}
      >
        <Box sx={{ transition: 'opacity 0.3s' }}>
          {renderPage()}
        </Box>
      </Layout>
    </ThemeProvider>
  );
};

export default App;