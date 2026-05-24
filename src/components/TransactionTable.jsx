import  { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';

import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';

const TransactionTable = ({ transactions, loading, currentPage, setCurrentPage, totalPages, isDark }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState(null);


  const maskCard = (num) => {
    if (!num) return '••••••******••••';
    const clean = num.replace(/\D/g, '');
    if (clean.length < 10) return num;
    return `${clean.substring(0, 6)}******${clean.substring(clean.length - 4)}`;
  };


  const formatAmount = (amt) => {
    return parseFloat(amt || 0).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) + ' ' + d.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const searchMatch = 
      (tx.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.cardHolderName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'ALL' || tx.status.toUpperCase() === statusFilter;
    const currencyMatch = currencyFilter === 'ALL' || tx.currency === currencyFilter;

    return searchMatch && statusMatch && currencyMatch;
  });

  const currencies = [...new Set(transactions.map(tx => tx.currency))].filter(Boolean);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5  }}>
      
    
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        
        
        <TextField
          placeholder="Search by Order ID, email, name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ width: '100%', maxWidth: { xs: '100%', md: 400 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
              </InputAdornment>
            ),
            sx: { fontSize: '12px' }
          }}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', items: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          
      
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel id="status-filter-label" sx={{ fontSize: '12px' }}>Status</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ borderRadius: 2.5, fontSize: '12px' }}
            >
              <option value="ALL" style={{ background: '#0b1023', color: '#fff' }}>All Statuses</option>
              <option value="SUCCESS" style={{ background: '#0b1023', color: '#fff' }}>Success</option>
              <option value="FAILED" style={{ background: '#0b1023', color: '#fff' }}>Failed</option>
              <option value="PENDING" style={{ background: '#0b1023', color: '#fff' }}>Pending</option>
            </Select>
          </FormControl>

         
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel id="currency-filter-label" sx={{ fontSize: '12px' }}>Currency</InputLabel>
            <Select
              labelId="currency-filter-label"
              label="Currency"
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              sx={{ borderRadius: 2.5, fontSize: '12px' }}
            >
              <option value="ALL" style={{ background: '#0b1023', color: '#fff' }}>All Currencies</option>
              {currencies.map(curr => (
                <option key={curr} value={curr} style={{ background: '#0b1023', color: '#fff' }}>{curr}</option>
              ))}
            </Select>
          </FormControl>

        </Box>
      </Box>

   
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          bgcolor: isDark ? 'rgba(11, 16, 35, 0.4)' : 'rgba(255, 255, 255, 0.4)'
        }}
      >
        <Table sx={{ minWidth: 800 }} size="small" aria-label="axipays transaction logs">
          <TableHead>
            <TableRow sx={{ bgcolor: isDark ? 'rgba(5, 8, 22, 0.4)' : 'rgba(248, 250, 252, 0.8)' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '12px', py: 2 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '12px', py: 2 }}>Cardholder</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '12px', py: 2 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '12px', py: 2 }}>Card Number</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px', py: 2 }}>Expiry</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px', py: 2 }}>CVC</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '12px', py: 2 }}>Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px', py: 2 }}>Currency</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px', py: 2 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '12px', py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, color: '#94A3B8' }}>
                    <CircularProgress size={24} />
                    <Typography variant="caption">Loading transaction logs...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6, color: '#64748b' }}>
                  <Typography variant="caption">No matching transaction records found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow 
                  key={tx.orderId}
                  sx={{ 
                    borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  <TableCell sx={{ fontMono: true, fontWeight: 'bold', color: '#60a5fa', py: 1.5 }}>
                    {tx.orderId}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'medium', py: 1.5 }}>{tx.cardHolderName || 'N/A'}</TableCell>
                  <TableCell sx={{ color: '#94A3B8', py: 1.5 }}>{tx.email || 'N/A'}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '11px', color: '#cbd5e1', py: 1.5 }}>{maskCard(tx.cardNumber)}</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'monospace', fontSize: '11px', py: 1.5 }}>
                    {tx.expiryMonth && tx.expiryYear ? `${tx.expiryMonth}/${tx.expiryYear.toString().slice(-2)}` : 'N/A'}
                  </TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b', py: 1.5 }}>***</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, py: 1.5 }}>{formatAmount(tx.amount)}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#3B82F6', py: 1.5 }}>{tx.currency}</TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <Box 
                      component="span"
                      sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        px: 1.5, 
                        py: 0.3, 
                        borderRadius: 10, 
                        fontSize: '9px', 
                        fontWeight: 'bold', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px',
                        bgcolor: tx.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : (tx.status === 'failed' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
                        color: tx.status === 'success' ? '#34d399' : (tx.status === 'failed' ? '#f87171' : '#fbbf24'),
                        border: tx.status === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : (tx.status === 'failed' ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)')
                      }}
                    >
                      {tx.status}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    <IconButton
                      onClick={() => setSelectedTx(tx)}
                      size="small"
                      sx={{ 
                        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                        borderRadius: 2,
                        color: '#94a3b8',
                        '&:hover': {
                          color: '#3B82F6',
                          borderColor: '#3B82F6',
                          bgcolor: 'rgba(59, 130, 246, 0.05)'
                        }
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && transactions.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Page <span style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>{currentPage}</span> of <span style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>{totalPages}</span>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outlined"
              size="small"
              startIcon={<ChevronLeftIcon />}
              sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', color: isDark ? '#cbd5e1' : '#475569' }}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outlined"
              size="small"
              endIcon={<ChevronRightIcon />}
              sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', color: isDark ? '#cbd5e1' : '#475569' }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      
      <Drawer
        anchor="right"
        open={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 420,
            bgcolor: isDark ? '#0b1023' : '#ffffff',
            borderLeft: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 0 40px rgba(0,0,0,0.4)',
            backgroundImage: 'none',
          }
        }}
      >
        {selectedTx && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 4, justifyContent: 'space-between' }}>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2.5, borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Transaction Details</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>Ref: {selectedTx.orderId}</Typography>
                </Box>
                <IconButton 
                  onClick={() => setSelectedTx(null)}
                  sx={{ border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', borderRadius: 2.5 }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

         
              <Box sx={{ py: 3, bgcolor: 'rgba(5, 8, 22, 0.4)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', borderRadius: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 10, 
                    fontSize: '9px', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    bgcolor: selectedTx.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : (selectedTx.status === 'failed' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)'),
                    color: selectedTx.status === 'success' ? '#34d399' : (selectedTx.status === 'failed' ? '#f87171' : '#fbbf24'),
                    border: selectedTx.status === 'success' ? '1px solid rgba(16, 185, 129, 0.25)' : (selectedTx.status === 'failed' ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)'),
                    boxShadow: selectedTx.status === 'success' ? '0 0 12px rgba(16, 185, 129, 0.12)' : 'none'
                  }}
                >
                  ● {selectedTx.status}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
                  {selectedTx.currency} {formatAmount(selectedTx.amount)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
                  <AccessTimeIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">{formatDate(selectedTx.createdAt)}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                
               
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#3B82F6', letterSpacing: '1px', textTransform: 'uppercase' }}>Card Info</Typography>
                  
                  <Box sx={{ bgcolor: 'rgba(5, 8, 22, 0.2)', border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)', borderRadius: 3, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '12px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><PersonIcon sx={{ fontSize: 16 }} /> Holder:</span>
                      <span style={{ fontWeight: 'bold' }}>{selectedTx.cardHolderName || 'N/A'}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><SecurityIcon sx={{ fontSize: 16 }} /> Number:</span>
                      <span style={{ fontFamily: 'monospace' }}>{maskCard(selectedTx.cardNumber)}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarTodayIcon sx={{ fontSize: 14 }} /> Expiry:</span>
                      <span style={{ fontFamily: 'monospace' }}>{selectedTx.expiryMonth && selectedTx.expiryYear ? `${selectedTx.expiryMonth} / ${selectedTx.expiryYear}` : 'N/A'}</span>
                    </Box>
                  </Box>
                </Box>

            
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#06B6D4', letterSpacing: '1px', textTransform: 'uppercase' }}>Billing Address</Typography>
                  
                  <Box sx={{ bgcolor: 'rgba(5, 8, 22, 0.2)', border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)', borderRadius: 3, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '12px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><EmailIcon sx={{ fontSize: 16 }} /> Email:</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }} title={selectedTx.email}>{selectedTx.email || 'N/A'}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><PhoneIcon sx={{ fontSize: 16 }} /> Phone:</span>
                      <span style={{ fontFamily: 'monospace' }}>{selectedTx.phone || 'N/A'}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}><PlaceIcon sx={{ fontSize: 16 }} /> Address:</span>
                      <span style={{ textAlign: 'right', lineHeight: 1.5, maxWidth: 180, fontWeight: 'medium' }}>
                        {selectedTx.address || 'N/A'}{selectedTx.country ? `, ${selectedTx.country}` : ''}
                      </span>
                    </Box>
                  </Box>
                </Box>

              </Box>

            </Box>

           
            <Button
              onClick={() => setSelectedTx(null)}
              variant="contained"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Close Details
            </Button>

          </Box>
        )}
      </Drawer>

    </Box>
  );
};

export default TransactionTable;
