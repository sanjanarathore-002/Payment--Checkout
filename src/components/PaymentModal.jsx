import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';


import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LaptopIcon from '@mui/icons-material/Laptop';

import { calculateAxipaysHash } from '../utils/crypto';

const STEPS = [
  { id: 'validating', label: 'Validating card details' },
  { id: 'authorizing', label: 'Securing payload signature' },
  { id: 'processing', label: 'Clearing details with AXIPAYS' },
  { id: 'redirecting', label: 'Redirecting to secure gateway' }
];

const PaymentModal = ({ paymentData, onClose }) => {
  
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [status, setStatus] = useState('timeline'); // 'timeline', 'redirect_mock', 'success', 'failed', 'pending'
  const [errorMsg, setErrorMsg] = useState('');
  
  
  const [orderId, setOrderId] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [activeRedirectTab, setActiveRedirectTab] = useState(0); // 0 = iframe, 1 = browser

  
  useEffect(() => {
    let stepInterval;
    let isMounted = true;

   
    stepInterval = setInterval(() => {
      setCurrentStepIdx(prev => {
        if (prev < 3) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 1000);

   
    const triggerPaymentApi = async () => {
      try {
        const hash = await calculateAxipaysHash(paymentData.email, paymentData.cardNumber);
        const generatedOrderId = "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
        setOrderId(generatedOrderId);

        const payload = {
          orderId: generatedOrderId,
          cardHolderName: paymentData.cardHolderName,
          email: paymentData.email,
          cardNumber: paymentData.cardNumber,
          expiryMonth: paymentData.expiryMonth,
          expiryYear: paymentData.expiryYear,
          cardCVC: paymentData.cardCVC,
          amount: paymentData.amount,
          currency: paymentData.currency,
          country: paymentData.country,
          address: paymentData.address,
          phone: paymentData.phone
        };

        const response = await fetch("https://payment-assignment.onrender.com/initiate-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Hash": hash
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (!isMounted) return;

        if (response.status === 200 && data.redirect_url) {
          setRedirectUrl(data.redirect_url);
          // Switch to redirect simulator once the simulated loader steps complete
          setTimeout(() => {
            if (isMounted) setStatus('redirect_mock');
          }, 4000 - (currentStepIdx * 1000));
        } else {
          throw new Error(data.message || 'Failed to initiate payment');
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorMsg(err.message || 'Payment initiation failed due to network errors');
        setStatus('failed');
      }
    };

    triggerPaymentApi();

    return () => {
      isMounted = false;
      clearInterval(stepInterval);
    };
  }, [paymentData]);

  // Fetch final status from redirectUrl
  const fetchFinalPaymentStatus = async () => {
    try {
      const response = await fetch(redirectUrl);
      const data = await response.json();
      
      if (data.status === 'success') {
        setStatus('success');
      } else if (data.status === 'failed') {
        setStatus('failed');
        setErrorMsg(data.message || 'Transaction was declined by the bank.');
      } else {
        setStatus('pending');
      }
    } catch (err) {
      setStatus('pending');
    }
  };

  useEffect(() => {
    if (status === 'redirect_mock' && redirectUrl) {
      const timer = setTimeout(() => {
        fetchFinalPaymentStatus();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [status, redirectUrl]);

  return (
    <Dialog 
      open={true} 
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 0 25px rgba(59, 130, 246, 0.45)',
          overflow: 'hidden',
          position: 'relative'
        }
      }}
    >
    
      <Box sx={{ position: 'absolute', top: 0, right: 0, width: 140, height: 140, bg: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', filter: 'blur(32px)', pointerEvents: 'none' }} />

      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        
        
        {status === 'timeline' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 2 }}>
            
           
            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ position: 'relative', display: 'flex' }}>
                <CircularProgress size={48} thickness={4} sx={{ color: '#2563EB' }} />
                <ShieldIcon sx={{ color: '#06B6D4', fontSize: 24, position: 'absolute', top: 12, left: 12 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f8fafc' }}>
                Securing Payment Gateway
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                Ref: {orderId || 'Generating...'}
              </Typography>
            </Box>

            
            <Stepper activeStep={currentStepIdx} orientation="vertical" sx={{ maxWidth: 300, mx: 'auto' }}>
              {STEPS.map((step, idx) => (
                <Step key={step.id}>
                  <StepLabel
                    optional={idx === currentStepIdx ? <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 'bold' }}>Active...</Typography> : null}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: '12px',
                        fontWeight: idx <= currentStepIdx ? 700 : 500,
                        color: idx < currentStepIdx ? 'rgba(255,255,255,0.45)' : (idx === currentStepIdx ? '#3B82F6' : '#64748b'),
                      },
                      '& .MuiStepIcon-root': {
                        color: idx < currentStepIdx ? '#10b981' : (idx === currentStepIdx ? '#2563EB' : '#1e293b'),
                        border: idx === currentStepIdx ? 'none' : 'none',
                        '&.Mui-completed': {
                          color: '#10b981'
                        }
                      }
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

           
            <Box sx={{ width: '100%', bgcolor: 'rgba(5, 8, 22, 0.6)', border: '1px solid rgba(255,255,255,0.06)', height: 6, borderRadius: 2, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  bgcolor: 'linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)', 
                  boxShadow: '0 0 10px rgba(6,182,212,0.6)',
                  borderRadius: 2, 
                  transition: 'width 1s ease-out',
                  width: `${((currentStepIdx + 1) / 4) * 100}%`
                }} 
              />
            </Box>

          </Box>
        )}

       
        {status === 'redirect_mock' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 'bold', letterSpacing: '1px' }}>AXIPAYS SIMULATOR</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 0.5 }}>Processing Gateway Security</Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace', display: 'block', mt: 0.5 }}>Gateway loaded</Typography>
            </Box>

            <Box sx={{ bgcolor: 'rgba(5, 8, 22, 0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              {/* Header */}
              <Box sx={{ bgcolor: 'rgba(11, 16, 35, 0.8)', px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                </Box>
                <Box sx={{ bgcolor: 'rgba(5, 8, 22, 0.7)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 1.2, px: 2, py: 0.4, fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 180 }}>
                  🔒 secure.axipays.com/redirect
                </Box>
                <LaptopIcon sx={{ color: '#64748b', fontSize: 16 }} />
              </Box>

             
              <Tabs 
                value={activeRedirectTab} 
                onChange={(e, val) => setActiveRedirectTab(val)} 
                variant="fullWidth" 
                sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: 40 }}
              >
                <Tab label="Embedded Iframe" sx={{ fontSize: '10px', textTransform: 'none', fontWeight: 'bold', minHeight: 40 }} />
                <Tab label="Browser Tab" sx={{ fontSize: '10px', textTransform: 'none', fontWeight: 'bold', minHeight: 40 }} />
              </Tabs>

              <Box sx={{ p: 2.5, minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(5, 8, 22, 0.2)' }}>
                {activeRedirectTab === 0 ? (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', bgcolor: 'rgba(5,8,22,0.8)' }}>
                      <iframe 
                        src={redirectUrl} 
                        title="AXIPAYS embedded simulator"
                        style={{ width: '100%', height: 96, border: 0 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justify: 'center', gap: 1, p: 1, bgcolor: 'rgba(7, 11, 25, 0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 2 }}>
                      <CircularProgress size={12} thickness={5} sx={{ color: '#2563EB' }} />
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '10px' }}>Simulating clearance check...</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Load gateway page in a secure browser tab</Typography>
                    <Button
                      onClick={() => window.open(redirectUrl, '_blank')}
                      variant="contained"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                    >
                      Open Secure Tab
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

           
            <Button
              onClick={fetchFinalPaymentStatus}
              variant="contained"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: 'linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)',
                py: 1.5
              }}
            >
              Resolve Status Instantly
            </Button>

          </Box>
        )}

       
        {status === 'success' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3, py: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '50%', color: '#10b981', display: 'flex' }}>
              <CheckCircleIcon sx={{ fontSize: 44 }} />
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>Payment Successful</Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
                Your transaction has been processed and cleared by AXIPAYS.
              </Typography>
            </Box>

           
           
            <Box sx={{ width: '100%', bgcolor: 'rgba(5, 8, 22, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, fontFamily: 'monospace', fontSize: '11px', textAlign: 'left' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Order ID:</span>
                <span style={{ color: '#cbd5e1' }}>{orderId || 'ORD-9841'}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Amount Paid:</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>{paymentData.currency} {paymentData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Gateway Status:</span>
                <span style={{ color: '#10b981' }}>Success (200 OK)</span>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Button onClick={onClose} variant="outlined" fullWidth sx={{ border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                Done
              </Button>
              <Button 
                onClick={() => alert(`Receipt Info:\nID: ${orderId}\nCleared: Success`)} 
                variant="contained" 
                fullWidth
              >
                View Details
              </Button>
            </Box>

          </Box>
        )}

       
        {status === 'failed' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3, py: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '50%', color: '#f43f5e', display: 'flex' }}>
              <CancelIcon sx={{ fontSize: 44 }} />
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>Payment Declined</Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
                The gateway server returned an error during clearance.
              </Typography>
            </Box>

            {/* Error reason */}
            <Box sx={{ width: '100%', bgcolor: 'rgba(5, 8, 22, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, fontFamily: 'monospace', fontSize: '11px', textAlign: 'left' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Reason:</span>
                <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>{errorMsg || 'Transaction declined.'}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status Code:</span>
                <span style={{ color: '#cbd5e1' }}>DECLINED (400)</span>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Button onClick={onClose} variant="outlined" fullWidth sx={{ border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setStatus('timeline');
                  setCurrentStepIdx(0);
                  setErrorMsg('');
                }} 
                variant="contained" 
                color="error" 
                fullWidth
              >
                Retry
              </Button>
            </Box>

          </Box>
        )}

        
        {status === 'pending' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 3, py: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '50%', color: '#f59e0b', display: 'flex' }}>
              <HourglassEmptyIcon sx={{ fontSize: 44 }} />
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>Payment Pending</Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
                Your bank is verifying the transaction clearance codes.
              </Typography>
            </Box>

            <Box sx={{ width: '100%', bgcolor: 'rgba(5, 8, 22, 0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#cbd5e1', lineHeight: 1.5, display: 'block' }}>
                This transaction has been sent successfully but remains under review. You can close this screen; you will be notified once settlement clears.
              </Typography>
            </Box>

            <Button onClick={onClose} variant="outlined" fullWidth sx={{ border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
              Close
            </Button>

          </Box>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
