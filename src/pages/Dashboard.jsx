import  { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EqualizerIcon from '@mui/icons-material/Equalizer';

import TransactionTable from '../components/TransactionTable';

const Dashboard = ({ isDark }) => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  
  const [hoveredCurrencyIndex, setHoveredCurrencyIndex] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null); // { x, y, date, val }

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://payment-assignment.onrender.com/transactions?page=1&limit=500");
        const json = await response.json();
        
        if (json.status === 'Success' && Array.isArray(json.data)) {
          const sorted = json.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAllTransactions(sorted);
        } else {
          throw new Error(json.message || 'Failed to fetch transaction data');
        }
      } catch (err) {
        setError(err.message || 'Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

 
  const totalCount = allTransactions.length;
  
  const successVolume = allTransactions
    .filter(tx => tx.status === 'success')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

  const successCount = allTransactions
    .filter(tx => tx.status === 'success')
    .length;

  const failedCount = allTransactions
    .filter(tx => tx.status === 'failed' || tx.status === 'pending')
    .length;

  
  const statusCounts = allTransactions.reduce((acc, tx) => {
    const stat = tx.status || 'pending';
    acc[stat] = (acc[stat] || 0) + 1;
    return acc;
  }, { success: 0, failed: 0, pending: 0 });

  
  const currencyGroups = allTransactions.reduce((acc, tx) => {
    const curr = tx.currency || 'USD';
    acc[curr] = (acc[curr] || 0) + parseFloat(tx.amount || 0);
    return acc;
  }, {});

  const totalCurrencyVolume = Object.values(currencyGroups).reduce((s, v) => s + v, 0);
  const currencyData = Object.entries(currencyGroups)
    .map(([currency, volume]) => ({
      currency,
      volume,
      percentage: totalCurrencyVolume > 0 ? (volume / totalCurrencyVolume) * 100 : 0
    }))
    .sort((a, b) => b.volume - a.volume);

 
  const volumeByDate = allTransactions
    .filter(tx => tx.status === 'success')
    .reduce((acc, tx) => {
      if (!tx.createdAt) return acc;
      const dateStr = new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      acc[dateStr] = (acc[dateStr] || 0) + parseFloat(tx.amount || 0);
      return acc;
    }, {});

  const sortedDates = Object.keys(volumeByDate).sort((a, b) => new Date(a) - new Date(b));
  const chartDates = sortedDates.slice(-8);
  const chartVolumes = chartDates.map(d => volumeByDate[d]);

 
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTxs = allTransactions.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(allTransactions.length / pageSize) || 1;

  const donutR = 50;
  const donutCirc = 2 * Math.PI * donutR;
  let cumulativePercent = 0;

  const donutColors = [
    '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'
  ];


  const svgWidth = 500;
  const svgHeight = 200;
  const chartPaddingLeft = 55;
  const chartPaddingRight = 20;
  const chartPaddingTop = 20;
  const chartPaddingBottom = 30;

  const graphWidth = svgWidth - chartPaddingLeft - chartPaddingRight;
  const graphHeight = svgHeight - chartPaddingTop - chartPaddingBottom;

  const maxVolume = chartVolumes.length > 0 ? Math.max(...chartVolumes) * 1.15 : 1000;
  const minVolume = 0;

  const points = chartVolumes.map((vol, idx) => {
    const x = chartPaddingLeft + (idx / (chartVolumes.length - 1)) * graphWidth;
    const y = svgHeight - chartPaddingBottom - ((vol - minVolume) / (maxVolume - minVolume)) * graphHeight;
    return { x, y, date: chartDates[idx], value: vol };
  });

  let linePathD = '';
  let areaPathD = '';
  if (points.length > 0) {
    linePathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
      const cpY2 = next.y;
      linePathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    areaPathD = `${linePathD} L ${points[points.length - 1].x} ${svgHeight - chartPaddingBottom} L ${points[0].x} ${svgHeight - chartPaddingBottom} Z`;
  }

  const formatVal = (val) => {
    return parseFloat(val).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
    
      <Grid container spacing={3}   sx={{paddingTop:"70px"}}>
        
        {/* Card 1: Total Transactions */}
        <Grid item xs={12} sm={6} md={3} >
          <Card sx={{ position: 'relative', overflow: 'hidden', height: '100%', transition: 'all 0.3s ease', '&:hover': { borderColor: 'rgba(59, 130, 246, 0.3)', boxShadow: '0 0 25px rgba(59, 130, 246, 0.15)' } }}>
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, bg: 'rgba(59, 130, 246, 0.03)', borderRadius: '50%', filter: 'blur(20px)' }} />
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 650, letterSpacing: '1px', textTransform: 'uppercase' }}>Total Transactions</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>{loading ? '...' : totalCount}</Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 3, bgcolor: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#3B82F6', display: 'flex' }}>
                  <EqualizerIcon />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 3 }}>
                <TrendingUpIcon sx={{ color: '#10b981', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>+12.4%</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>since last month</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Total Success Volume */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ position: 'relative', overflow: 'hidden', height: '100%', transition: 'all 0.3s ease', '&:hover': { borderColor: 'rgba(6, 182, 212, 0.3)', boxShadow: '0 0 25px rgba(6, 182, 212, 0.15)' } }}>
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, bg: 'rgba(6, 182, 212, 0.03)', borderRadius: '50%', filter: 'blur(20px)' }} />
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 650, letterSpacing: '1px', textTransform: 'uppercase' }}>Success Volume</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>{loading ? '...' : `$${formatVal(successVolume)}`}</Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 3, bgcolor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', color: '#06B6D4', display: 'flex' }}>
                  <AttachMoneyIcon />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 3 }}>
                <TrendingUpIcon sx={{ color: '#10b981', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>+8.2%</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>net volume value</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Total Success Count */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ position: 'relative', overflow: 'hidden', height: '100%', transition: 'all 0.3s ease', '&:hover': { borderColor: 'rgba(16, 185, 129, 0.3)', boxShadow: '0 0 25px rgba(16, 185, 129, 0.15)' } }}>
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, bg: 'rgba(16, 185, 129, 0.03)', borderRadius: '50%', filter: 'blur(20px)' }} />
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 650, letterSpacing: '1px', textTransform: 'uppercase' }}>Success Count</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>{loading ? '...' : successCount}</Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10B981', display: 'flex' }}>
                  <CheckCircleIcon />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 3 }}>
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                  {totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0'}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Success Clearance Rate</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4: Total Failed/Pending */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ position: 'relative', overflow: 'hidden', height: '100%', transition: 'all 0.3s ease', '&:hover': { borderColor: 'rgba(244, 63, 94, 0.3)', boxShadow: '0 0 25px rgba(244, 63, 94, 0.15)' } }}>
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, bg: 'rgba(244, 63, 94, 0.03)', borderRadius: '50%', filter: 'blur(20px)' }} />
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 650, letterSpacing: '1px', textTransform: 'uppercase' }}>Failed / Pending</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>{loading ? '...' : failedCount}</Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: 3, bgcolor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)', color: '#F43F5E', display: 'flex' }}>
                  <CancelIcon />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 3 }}>
                <Typography variant="caption" sx={{ color: '#F43F5E', fontWeight: 'bold' }}>
                  {totalCount > 0 ? ((failedCount / totalCount) * 100).toFixed(1) : '0'}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>failed & pending rate</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

     
      <Grid container spacing={3}>
        
       
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon sx={{ color: '#3B82F6', fontSize: 20 }} />
                    Successful Transaction Volume Over Time
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>Daily processed settlement volume in USD equivalent</Typography>
                </Box>
                <Typography variant="caption" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)', px: 1, py: 0.3, borderRadius: 1.2, fontSize: '9px', fontWeight: 'bold' }}>LIVE METRICS</Typography>
              </Box>

              {loading ? (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={28} />
                </Box>
              ) : points.length === 0 ? (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>No transaction history found</Typography>
                </Box>
              ) : (
                <Box sx={{ position: 'relative' }}>
                  {hoveredPoint && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        zIndex: 30, 
                        bgcolor: 'rgba(5, 8, 22, 0.95)', 
                        border: '1px solid rgba(59, 130, 246, 0.4)', 
                        borderRadius: 2, 
                        p: 1.2, 
                        boxShadow: 3, 
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -100%)'
                      }}
                      style={{ left: `${(hoveredPoint.x / svgWidth) * 100}%`, top: `${(hoveredPoint.y / svgHeight) * 100 - 8}%` }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', display: 'block' }}>{hoveredPoint.date}</Typography>
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 800, mt: 0.2 }}>${parseFloat(hoveredPoint.value).toLocaleString()}</Typography>
                    </Box>
                  )}

                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '200px', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="mui-area-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>

                    {/* Y Axis Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                      const y = chartPaddingTop + p * graphHeight;
                      const val = maxVolume - p * (maxVolume - minVolume);
                      return (
                        <g key={i} style={{ opacity: 0.25 }}>
                          <line x1={chartPaddingLeft} y1={y} x2={svgWidth - chartPaddingRight} y2={y} stroke="#334155" strokeDasharray="3 3" />
                          <text x={chartPaddingLeft - 8} y={y + 3} textAnchor="end" fill="#94a3b8" style={{ fontFamily: 'monospace', fontSize: '9px', fontWeight: 'bold' }}>
                            ${formatVal(val)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient Fill */}
                    {areaPathD && <path d={areaPathD} fill="url(#mui-area-gradient)" />}

                    {/* Curve Line */}
                    {linePathD && <path d={linePathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' }} />}

                    {/* Interactive dots */}
                    {points.map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)} />
                        <circle cx={pt.x} cy={pt.y} r={hoveredPoint?.date === pt.date ? 5 : 3.5} fill={hoveredPoint?.date === pt.date ? "#06b6d4" : "#3b82f6"} stroke="#050816" strokeWidth="1.5" style={{ transition: 'all 0.2s', pointerEvents: 'none' }} />
                      </g>
                    ))}

                    {/* X axis labels */}
                    {points.map((pt, idx) => (
                      <text key={idx} x={pt.x} y={svgHeight - 10} textAnchor="middle" fill="#64748b" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                        {pt.date}
                      </text>
                    ))}
                  </svg>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Currency Donut Chart (4/12 grid) */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3.5, height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon sx={{ color: '#06B6D4', fontSize: 20 }} />
                  Currency Share Volume
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>Total volume distribution grouped by currency type</Typography>
              </Box>

              {loading ? (
                <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={28} />
                </Box>
              ) : currencyData.length === 0 ? (
                <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>No data found</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row', lg: 'column' }, alignItems: 'center', gap: 4, justifyContent: 'space-around', py: 1 }}>
                  
                  {/* Donut Draw */}
                  <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
                    <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      {currencyData.map((curr, idx) => {
                        const strokeDash = (curr.percentage / 100) * donutCirc;
                        const strokeOffset = donutCirc - ((cumulativePercent / 100) * donutCirc);
                        cumulativePercent += curr.percentage;

                        const color = donutColors[idx % donutColors.length];
                        const isHovered = hoveredCurrencyIndex === idx;

                        return (
                          <circle
                            key={curr.currency}
                            cx="60"
                            cy="60"
                            r={donutR}
                            fill="transparent"
                            stroke={color}
                            strokeWidth={isHovered ? 10 : 7.5}
                            strokeDasharray={`${strokeDash} ${donutCirc}`}
                            strokeDashoffset={strokeOffset}
                            strokeLinecap="round"
                            style={{ transition: 'all 0.3s', cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredCurrencyIndex(idx)}
                            onMouseLeave={() => setHoveredCurrencyIndex(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Donut Center */}
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      {hoveredCurrencyIndex !== null ? (
                        <>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', letterSpacing: '1px', color: '#cbd5e1' }}>
                            {currencyData[hoveredCurrencyIndex].currency}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#60a5fa', mt: 0.2 }}>
                            {currencyData[hoveredCurrencyIndex].percentage.toFixed(1)}%
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.5px' }}>CURRENCIES</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#3B82F6', mt: 0.2 }}>{currencyData.length} Types</Typography>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Legends */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', maxWidth: 280 }}>
                    {currencyData.slice(0, 4).map((curr, idx) => {
                      const color = donutColors[idx % donutColors.length];
                      return (
                        <Box 
                          key={curr.currency} 
                          onMouseEnter={() => setHoveredCurrencyIndex(idx)}
                          onMouseLeave={() => setHoveredCurrencyIndex(null)}
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            p: 1, 
                            borderRadius: 2, 
                            transition: 'bgcolor 0.2s', 
                            bgcolor: hoveredCurrencyIndex === idx ? 'rgba(255,255,255,0.05)' : 'transparent',
                            cursor: 'pointer'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', fontSize: '11px', color: hoveredCurrencyIndex === idx ? '#ffffff' : '#cbd5e1' }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                            {curr.currency}
                          </Box>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#cbd5e1' }}>
                            ${formatVal(curr.volume)} ({curr.percentage.toFixed(1)}%)
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                </Box>
              )}

            </CardContent>
          </Card>
        </Grid>

      </Grid>

      
      {!loading && (
        <Card>
          <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', uppercase: true }}>Transaction Clearance Breakdown</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Direct proportion of settlement clearance</Typography>
            </Box>

            <Grid container spacing={4} sx={{ mt: 0.5 }}>
              
              {/* Success */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' }}>
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>Success Clearance</Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1' }}>{statusCounts.success} ({((statusCounts.success / totalCount) * 100 || 0).toFixed(1)}%)</Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: 'rgba(5, 8, 22, 0.6)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', bgcolor: '#10b981', borderRadius: 2, width: `${(statusCounts.success / totalCount) * 100 || 0}%`, boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                </Box>
              </Grid>

              {/* Pending */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' }}>
                  <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>Pending Review</Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1' }}>{statusCounts.pending} ({((statusCounts.pending / totalCount) * 100 || 0).toFixed(1)}%)</Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: 'rgba(5, 8, 22, 0.6)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', bgcolor: '#f59e0b', borderRadius: 2, width: `${(statusCounts.pending / totalCount) * 100 || 0}%`, boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
                </Box>
              </Grid>

              {/* Failed */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' }}>
                  <Typography variant="caption" sx={{ color: '#f43f5e', fontWeight: 'bold' }}>Declined / Failed</Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1' }}>{statusCounts.failed} ({((statusCounts.failed / totalCount) * 100 || 0).toFixed(1)}%)</Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: 'rgba(5, 8, 22, 0.6)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', bgcolor: '#f43f5e', borderRadius: 2, width: `${(statusCounts.failed / totalCount) * 100 || 0}%`, boxShadow: '0 0 8px rgba(244,63,94,0.5)' }} />
                </Box>
              </Grid>

            </Grid>
          </CardContent>
        </Card>
      )}

     
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Transaction History</Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>Manage, search, and review all merchant checkout payments</Typography>
        </Box>
        
        <TransactionTable 
          transactions={paginatedTxs} 
          loading={loading}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          isDark={isDark}
        />
      </Box>

    </Box>
  );
};

export default Dashboard;
