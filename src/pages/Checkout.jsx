import  { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';


import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import GppGoodIcon from '@mui/icons-material/GppGood';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import HelpIcon from '@mui/icons-material/Help';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import { 
  validateLuhn, 
  detectCardBrand, 
  formatMaskedCardNumber, 
  formatExpiry 
} from '../utils/crypto';
import PaymentModal from '../components/PaymentModal';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'IN', name: 'India', flag: '🇮🇳', phoneCode: '+91' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phoneCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61' },
];

const Checkout = () => {
  
  const [cardHolder, setCardHolder] = useState('');
  const [email, setEmail] = useState('');
  const [rawCardNumber, setRawCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('149.00');
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [address, setAddress] = useState('');
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phone, setPhone] = useState('');


  const [isFlipped, setIsFlipped] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [errors, setErrors] = useState({});
  const [cardBrand, setCardBrand] = useState('unknown');
  const [isLuhnValid, setIsLuhnValid] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [initiationData, setInitiationData] = useState(null);

 
  useEffect(() => {
    const selected = COUNTRIES.find(c => c.code === country);
    if (selected) {
      setPhoneCode(selected.phoneCode);
    }
  }, [country]);

  useEffect(() => {
    const digits = rawCardNumber.replace(/\D/g, '');
    if (digits.length > 0) {
      setCardBrand(detectCardBrand(digits));
    } else {
      setCardBrand('unknown');
    }

    if (digits.length >= 13) {
      setIsLuhnValid(validateLuhn(digits));
    } else {
      setIsLuhnValid(null);
    }
  }, [rawCardNumber]);

  const handleCardNumberChange = (e) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '').substring(0, 16);
    setRawCardNumber(digits);

    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: null }));
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
    if (errors.expiry) {
      setErrors(prev => ({ ...prev, expiry: null }));
    }
  };

  const handleCvvChange = (e) => {
    const clean = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(clean);
    if (errors.cvv) {
      setErrors(prev => ({ ...prev, cvv: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!cardHolder.trim()) newErrors.cardHolder = 'Cardholder name is required';
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const digits = rawCardNumber.replace(/\D/g, '');
    if (!digits) {
      newErrors.cardNumber = 'Card number is required';
    } else if (digits.length < 13) {
      newErrors.cardNumber = 'Card number is incomplete';
    } else if (!validateLuhn(digits)) {
      newErrors.cardNumber = 'Invalid credit card number (fails Luhn check)';
    }

    if (!expiry) {
      newErrors.expiry = 'Expiry date is required';
    } else if (expiry.length < 5) {
      newErrors.expiry = 'Invalid expiry format (MM/YY)';
    } else {
      const [m, y] = expiry.split('/');
      const month = parseInt(m, 10);
      const year = parseInt('20' + y, 10);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      if (month < 1 || month > 12) {
        newErrors.expiry = 'Invalid month (01-12)';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = 'Card has already expired';
      }
    }

    if (!cvv) {
      newErrors.cvv = 'CVC is required';
    } else if (cvv.length < 3) {
      newErrors.cvv = 'CVC must be 3 or 4 digits';
    }

    if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      newErrors.amount = 'Please enter a valid payment amount';
    }

    if (!address.trim()) newErrors.address = 'Billing address is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaySecurely = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setInitiationData({
      cardHolderName: cardHolder,
      email: email,
      cardNumber: rawCardNumber,
      expiryMonth: expiry.split('/')[0],
      expiryYear: '20' + expiry.split('/')[1],
      cardCVC: cvv,
      amount: parseFloat(amount),
      currency: currency,
      country: COUNTRIES.find(c => c.code === country)?.name || country,
      address: address,
      phone: phoneCode + phone
    });

    setShowModal(true);
  };

  const activeCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', zIndex: 10, position: 'relative' ,pt: 6, pb: 12 }}>
      <Grid container spacing={4} alignItems="start">
        
        <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          <Box className="perspective-1000" sx={{ width: 'full', display: 'flex', justifyContent: 'center', py: 2 }}>
            <Box 
              className={`relative w-full max-w-md h-56 rounded-2xl transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            >
            
              <Box 
                sx={{ 
                  position: 'absolute', 
                  inset: 0, 
                  backfaceVisibility: 'hidden', 
                  borderRadius: 4, 
                  p: 3, 
                  bg: 'linear-gradient(135deg, #0f172a 0%, #050816 100%)', 
                  border: '1px solid rgba(59, 130, 246, 0.2)', 
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden'
                }}
              >
                
                <Box sx={{ position: 'absolute', inset: 0, opacity: 0.12, background: 'radial-gradient(circle_at_center, #60a5fa 0%, transparent 80%)' }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', zIndex: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: '9px', color: '#60a5fa', fontWeight: 'bold', letterSpacing: '1.5px' }}>
                      AXIPAYS SECURE
                    </Typography>
                    <Box sx={{ width: 40, height: 28, bgcolor: 'rgba(245, 158, 11, 0.75)', borderRadius: 1.5, mt: 0.5, border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5, width: 24, height: 16, opacity: 0.4 }}>
                        {[...Array(6)].map((_, i) => <Box key={i} sx={{ border: '1px solid #000' }} />)}
                      </Box>
                    </Box>
                  </Box>

                  
                  <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                    {cardBrand === 'visa' && (
                      <Typography variant="h5" sx={{ color: '#ffffff', fontStyle: 'italic', fontWeight: 900, letterSpacing: '-1px' }}>Visa</Typography>
                    )}
                    {cardBrand === 'mastercard' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: -1 }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#ef4444', opacity: 0.9, mr: -1.2 }} />
                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#f59e0b', opacity: 0.9 }} />
                      </Box>
                    )}
                    {cardBrand === 'unknown' && (
                      <CreditCardIcon sx={{ color: '#94a3b8', fontSize: 32 }} />
                    )}
                  </Box>
                </Box>

              
                <Box sx={{ zIndex: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '1px', display: 'block', mb: 0.5 }}>CARD NUMBER</Typography>
                  <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: '3px', fontWeight: 'medium', fontSize: { xs: '18px', sm: '21px' }, color: '#f8fafc' }}>
                    {rawCardNumber.length > 0 
                      ? formatMaskedCardNumber(rawCardNumber)
                      : '•••• •••• •••• ••••'}
                  </Typography>
                </Box>

               
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', zIndex: 1 }}>
                  <Box sx={{ minWidth: 0, pr: 2 }}>
                    <Typography variant="caption" sx={{ fontSize: '8px', color: '#94a3b8', display: 'block' }}>CARD HOLDER</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cardHolder || 'JOHN DOE'}
                    </Typography>
                  </Box>
                  <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ fontSize: '8px', color: '#94a3b8', display: 'block' }}>EXPIRES</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#e2e8f0' }}>
                      {expiry || 'MM/YY'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

            
              <Box 
                sx={{ 
                  position: 'absolute', 
                  inset: 0, 
                  backfaceVisibility: 'hidden', 
                  transform: 'rotateY(180deg)',
                  borderRadius: 4, 
                  py: 3, 
                  bg: 'linear-gradient(135deg, #0b1023 0%, #0f172a 100%)', 
                  border: '1px solid rgba(59, 130, 246, 0.2)', 
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ width: '100%', height: 44, bgcolor: 'rgba(5, 8, 22, 0.85)', mt: 1 }} />
                
                <Box sx={{ px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ flexGrow: 1, bgcolor: 'rgba(255, 255, 255, 0.08)', height: 36, display: 'flex', alignItems: 'center', px: 2, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', textDecoration: 'line-through' }}>
                    xxxx xxxx xxxx
                  </Box>
                  <Box sx={{ width: 60, bgcolor: '#fef08a', color: '#0f172a', textAlign: 'center', fontFamily: 'monospace', py: 0.8, borderRadius: 1, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '14px', ml: 2 }}>
                    {cvv ? '•'.repeat(cvv.length) : 'CVC'}
                  </Box>
                </Box>

                <Box sx={{ px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94a3b8' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ShieldIcon sx={{ fontSize: 14, color: '#3B82F6' }} /> Secure Encryption
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '10px', color: '#94a3b8' }}>PCI-DSS Compliant</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          
          <Paper 
            component="form"
            onSubmit={handlePaySecurely}
            elevation={0}
            sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 4 }}
          >
          
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', sm: 'center' }, pb: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.2, borderRadius: 3, bgcolor: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#3B82F6', display: 'flex' }}>
                  <LockIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Secure Checkout</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <GppGoodIcon sx={{ color: '#10b981', fontSize: 14 }} />
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '11px' }}>SSL Encrypted Connection</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="caption" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', px: 1, py: 0.2, borderRadius: 1.2, fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px' }}>PCI-DSS</Typography>
                <Typography variant="caption" sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa', px: 1, py: 0.2, borderRadius: 1.2, fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px' }}>3D SECURE</Typography>
              </Box>
            </Box>

          
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', letterSpacing: '1px', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 6, height: 6, bgcolor: '#3B82F6', borderRadius: '50%' }} /> Contact Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Card Holder Name"
                    variant="outlined"
                    value={cardHolder}
                    onChange={(e) => {
                      setCardHolder(e.target.value);
                      if (errors.cardHolder) setErrors(prev => ({ ...prev, cardHolder: null }));
                    }}
                    onFocus={() => { setFocusedField('cardHolder'); setIsFlipped(false); }}
                    onBlur={() => setFocusedField('')}
                    error={Boolean(errors.cardHolder)}
                    helperText={errors.cardHolder}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                    }}
                    onFocus={() => { setFocusedField('email'); setIsFlipped(false); }}
                    onBlur={() => setFocusedField('')}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', letterSpacing: '1px', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 6, height: 6, bgcolor: '#3B82F6', borderRadius: '50%' }} /> Card Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    variant="outlined"
                    placeholder="4111 11•• •••• 1111"
                    value={focusedField === 'cardNumber' ? rawCardNumber : (rawCardNumber ? formatMaskedCardNumber(rawCardNumber) : '')}
                    onChange={handleCardNumberChange}
                    onFocus={() => { setFocusedField('cardNumber'); setIsFlipped(false); }}
                    onBlur={() => setFocusedField('')}
                    error={Boolean(errors.cardNumber)}
                    helperText={
                      errors.cardNumber || 
                      (isLuhnValid !== null ? (
                        isLuhnValid ? (
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                            <CheckCircleIcon sx={{ fontSize: 14 }} /> Luhn Validation Passed
                          </span>
                        ) : (
                          <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                            
                            <ErrorIcon sx={{ fontSize: 14 }} /> <span>Invalid Card Number</span>
                          </span>
                        )
                      ) : null)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {cardBrand === 'visa' && <Typography sx={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '11px', fontStyle: 'italic' }}>Visa</Typography>}
                          {cardBrand === 'mastercard' && <Typography sx={{ color: '#f97316', fontWeight: 'bold', fontSize: '11px', fontStyle: 'italic' }}>MasterCard</Typography>}
                          {cardBrand === 'unknown' && <HelpIcon sx={{ color: '#64748b', fontSize: 16 }} />}
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    variant="outlined"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    onFocus={() => { setFocusedField('expiry'); setIsFlipped(false); }}
                    onBlur={() => setFocusedField('')}
                    error={Boolean(errors.expiry)}
                    helperText={errors.expiry}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="CVV / CVC"
                    variant="outlined"
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={handleCvvChange}
                    onFocus={() => { setFocusedField('cvv'); setIsFlipped(true); }} // flips mock card front to back
                    onBlur={() => { setFocusedField(''); setIsFlipped(false); }} // flips back
                    error={Boolean(errors.cvv)}
                    helperText={errors.cvv}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Payment Amount"
                    variant="outlined"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
                    }}
                    onFocus={() => { setFocusedField('amount'); setIsFlipped(false); }}
                    onBlur={() => setFocusedField('')}
                    error={Boolean(errors.amount)}
                    helperText={errors.amount}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontWeight: 'bold', fontSize: '14px', color: '#94a3b8' }}>{activeCurrency.symbol}</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="currency-select-label">Currency</InputLabel>
                    <Select
                      labelId="currency-select-label"
                      label="Currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      sx={{ borderRadius: 3 }}
                    >
                      {CURRENCIES.map(curr => (
                        <MenuItem key={curr.code} value={curr.code}>{curr.code} - {curr.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', letterSpacing: '1px', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 6, height: 6, bgcolor: '#3B82F6', borderRadius: '50%' }} /> Billing & Delivery
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="country-select-label">Country</InputLabel>
                    <Select
                      labelId="country-select-label"
                      label="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      sx={{ borderRadius: 3 }}
                    >
                      {COUNTRIES.map(c => (
                        <MenuItem key={c.code} value={c.code}>{c.flag} {c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''));
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                    }}
                    onFocus={() => { setFocusedField('phone'); setIsFlipped(false); }}
                    onBlur={() => setFocusedField('')}
                    error={Boolean(errors.phone)}
                    helperText={errors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1.5, borderRight: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '13px', fontWeight: 'bold', mr: 1 }}>
                            <span>{COUNTRIES.find(c => c.code === country)?.flag}</span>
                            <span>{phoneCode}</span>
                          </Box>
                          <PhoneIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Street Address"
                variant="outlined"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                }}
                onFocus={() => { setFocusedField('address'); setIsFlipped(false); }}
                onBlur={() => setFocusedField('')}
                error={Boolean(errors.address)}
                helperText={errors.address}
                InputProps={{
                  startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                }}
              />
            </Box>

           
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                py: 2,
                background: 'linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.35)',
                fontSize: '15px',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1d4ed8 0%, #0891b2 100%)',
                  boxShadow: '0 0 30px rgba(37, 99, 235, 0.55)',
                },
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <LockIcon sx={{ fontSize: 18 }} />
              Pay Securely {activeCurrency.symbol}{parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Button>

        
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: { xs: 2, sm: 4 }, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                <ShieldIcon sx={{ fontSize: 14, color: '#3b82f6' }} /> SSL SECURE 256-BIT
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                <ShieldIcon sx={{ fontSize: 14, color: '#06b6d4' }} /> PCI-DSS COMPLIANT
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                <ShieldIcon sx={{ fontSize: 14, color: '#10b981' }} /> 3D SECURE ENROLLED
              </Box>
            </Box>

          </Paper>

        </Grid>

        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 3.5, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: 96, height: 96, bgcolor: 'rgba(37, 99, 235, 0.04)', borderRadius: '50%', filter: 'blur(24px)', pointerEvents: 'none' }} />
            
            <Typography variant="h6" sx={{ fontWeight: 800, pb: 1.5, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>Order Summary</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Product item details */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, bgcolor: 'rgba(5, 8, 22, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', fontWeight: 'bold', fontSize: '15px' }}>
                    AP
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>SaaS Platform License</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>Premium Plan • Monthly</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                  {activeCurrency.symbol}{parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Box sx={{ height: '1px', bgcolor: 'rgba(255, 255, 255, 0.05)' }} />

              {/* Subtotals breakdown */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                  <Typography variant="caption">Subtotal</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                    {activeCurrency.symbol}{parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                  <Typography variant="caption">Gateway Fee</Typography>
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>FREE</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                  <Typography variant="caption">Estimated Tax</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'medium' }}>{activeCurrency.symbol}0.00</Typography>
                </Box>
              </Box>

              <Box sx={{ height: '1px', bgcolor: 'rgba(255, 255, 255, 0.08)' }} />

              {/* Total Summary */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#cbd5e1' }}>Total Payment</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff' }}>
                  {activeCurrency.symbol}{parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>

            {/* Guaranteed safe tag badge */}
            <Box sx={{ bgcolor: 'rgba(7, 11, 25, 0.4)', border: '1px solid rgba(255,255,255,0.06)', p: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1' }}>
                <GppGoodIcon sx={{ color: '#2563EB', fontSize: 18 }} /> Guaranteed Safe Checkout
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.5, display: 'block' }}>
                Your details are protected using AES 256-bit encryption and are processed in fully PCI compliant servers.
              </Typography>
            </Box>

          </Paper>

         
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(37,99,235,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', items: 'center', justifyContent: 'center', color: '#3b82f6', pt: 1.2 }}>
              <LockIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#cbd5e1' }}>
              AXIPAYS Trust Shield
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.5 }}>
              We are audited yearly by external safety regulators to ensure maximum credit card security compliance.
            </Typography>
          </Paper>

        </Grid>

      </Grid>

      
      {showModal && initiationData && (
        <PaymentModal 
          paymentData={initiationData} 
          onClose={() => {
            setShowModal(false);
            setInitiationData(null);
          }} 
        />
      )}

    </Box>
  );
};

export default Checkout;
