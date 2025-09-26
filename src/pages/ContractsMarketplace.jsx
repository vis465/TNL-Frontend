import React, { useEffect, useState } from 'react';
import { AttachMoney, TrendingUp, WarningAmber, AccessTime } from '@mui/icons-material';

// import { listTemplates, buyContract } from '../services/contractsService';
import { LocationOn, MyLocation, Inventory2, AltRoute, Speed, Bolt, DirectionsRun, LocalShipping, LocalMall, Business } from '@mui/icons-material';

// Mock services for demo purposes
import axiosInstance from '../utils/axios';

const listTemplates = async () => {
  try {
    const response = await axiosInstance.get('/contracts/templates');
    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const buyContract = async (id) => {
  try {
    const response = await axiosInstance.post(`/contracts/buy/${id}`);
    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};


const getMyContracts = async () => {
  try {
    const response = await axiosInstance.get('/contracts/me');
    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};


export default function ContractsMarketplace() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [ownedTemplateIds, setOwnedTemplateIds] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([listTemplates(), getMyContracts()])
      .then(([tpls, mine]) => {
        setTemplates(tpls);
        const ids = (mine?.active || []).map(i => (i.templateId && i.templateId._id) ? i.templateId._id : i.templateId);
        setOwnedTemplateIds(ids.filter(Boolean));
      })
      .catch(e => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const onBuy = async (id) => {
    setError(''); setSuccess('');
    try {
      await buyContract(id);
      setSuccess('Contract purchased successfully');
      Promise.all([listTemplates(), getMyContracts()]).then(([tpls, mine]) => {
        setTemplates(tpls);
        const ids = (mine?.active || []).map(i => (i.templateId && i.templateId._id) ? i.templateId._id : i.templateId);
        setOwnedTemplateIds(ids.filter(Boolean));
      });
    } catch (e) {
      setError(e.message || 'Purchase failed');
    }
  };

  const getCriteriaIcon = (type) => {
    const iconStyles = { fontSize: 16, mr: 0.5 };
    const iconMap = {
      sourceCity: <LocationOn />,
      destinationCity: <MyLocation />,
      cargoName: <Inventory2 />,
      sourceCompany: <Business />,
      destinationCompany: <Business />,
      minDistance: <AltRoute />,
      maxDamagePct: <WarningAmber />,
      maxTopSpeedKmh: <Speed />,
      minAvgSpeedKmh: <Bolt />,
      maxAvgSpeedKmh: <DirectionsRun />,
      minRevenue: <AttachMoney />,
      maxTruckDamagePercent: <LocalShipping />,
      maxTrailerDamagePercent: <LocalMall />
    };
    return iconMap[type] || '✅';
  };

  const getCriteriaColor = (type) => {
    const colorMap = {
      sourceCity: 'primary',
      destinationCity: 'secondary',
      cargoName: 'info',
      minDistance: 'primary',
      maxDamagePct: 'warning',
      minRevenue: 'success',
      maxTruckDamagePercent: 'error',
      maxTrailerDamagePercent: 'error'
    };
    return colorMap[type] || 'default';
  };

  const styles = {
    mainContainer: {
      minHeight: '100vh',

      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
        pointerEvents: 'none'
      }
    },
    heroTitle: {
      color: 'white',
      fontWeight: 'bold',
      mb: 2,
      textShadow: '0 4px 20px rgba(0,0,0,0.3)',
      fontSize: { xs: '2.5rem', md: '3.5rem' }
    },
    heroSubtitle: {
      color: 'rgba(255,255,255,0.9)',
      maxWidth: '600px',
      mx: 'auto',

    },
    contractCard: (isHovered) => ({
      height: '100%',
      borderRadius: 4,
      overflow: 'visible',

      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: isHovered
        ? '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(102,126,234,0.3)'
        : '0 10px 30px rgba(0,0,0,0.2)',
      transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px 16px 0 0'
      }
    }),
    titleGradient: {
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 'bold'
    },
    metricBox: (color) => ({
      p: 2,
      borderRadius: 3,
      background: `linear-gradient(135deg, ${color}20 0%, ${color}20 100%)`,
      border: `1px solid ${color}40`,
      textAlign: 'center',
      transition: 'transform 0.2s',
      cursor: 'pointer',
      '&:hover': { transform: 'scale(1.05)' }
    }),
    taskBox: {
      mb: 3,
      p: 2,
      borderRadius: 3,
      background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
      border: '1px solid rgba(102,126,234,0.1)'
    },
    taskNumber: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      mr: 2
    },
    purchaseButton: {
      py: 1.5,
      borderRadius: 3,
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      textTransform: 'none',
      '&:hover': {
        background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
        boxShadow: '0 8px 25px rgba(102,126,234,0.6)',
        transform: 'translateY(-2px)'
      },
      transition: 'all 0.3s ease'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      flexDirection: 'column'
    },
    loadingSpinner: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      animation: 'pulse 2s ease-in-out infinite',
      mb: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '@keyframes pulse': {
        '0%': { transform: 'scale(1)', opacity: 1 },
        '50%': { transform: 'scale(1.1)', opacity: 0.7 },
        '100%': { transform: 'scale(1)', opacity: 1 }
      }
    }
  };


  return (
    <div style={styles.mainContainer}>
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '32px 16px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={styles.heroTitle}>
            Contracts Marketplace
          </h1>

        </div>

        {/* Alerts */}
        <div style={{ marginBottom: 32 }}>
          {error && (
            <div style={{
              padding: '16px',
              marginBottom: 16,
              borderRadius: 12,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255,255,255,0.95)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              border: '1px solid #f44336',
              color: '#d32f2f',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              ❌ {error}
            </div>
          )}
          {success && (
            <div style={{
              padding: '16px',
              marginBottom: 16,
              borderRadius: 12,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255,255,255,0.95)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              border: '1px solid #4caf50',
              color: '#2e7d32',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {success}
            </div>
          )}
        </div>

        {/* Contract Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 32,
          mb: 2
        }}>
          {templates.map((t, index) => (
            <div
              key={t._id}
              onMouseEnter={() => setHoveredCard(t._id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...styles.contractCard(hoveredCard === t._id),
                animation: `fadeInUp 0.8s ease-out ${index * 0.2}s both`,


              }}
            >
              <div style={{ padding: 24 }}>
                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>

                  <h3 style={{
                    ...styles.titleGradient,
                    fontSize: '1.5rem',
                    margin: 0,
                    lineHeight: 1.2
                  }}>
                    {t.title}
                  </h3>
                </div>

                {/* Description */}
                <p style={{
                  marginBottom: 24,

                  lineHeight: 1.6,
                  fontSize: '1rem',
                  color: 'white'
                }}>
                  {t.description}
                </p>

                {/* Key Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 16,
                  marginBottom: 24
                }}>
                  <div
                    style={styles.metricBox('#667eea')}
                    title="Purchase Price"
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>
                      <AttachMoney style={{ color: '#667eea' }} />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#667eea' }}>
                      {t.priceTokens}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      Price
                    </div>
                  </div>

                  <div
                    style={styles.metricBox('#4caf50')}
                    title="Reward Amount"
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>
                      <TrendingUp style={{ color: '#4caf50' }} />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4caf50' }}>
                      {t.rewardTokens}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      Reward
                    </div>
                  </div>

                  <div
                    style={styles.metricBox('#f44336')}
                    title="Penalty Amount"
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>
                      <WarningAmber style={{ color: '#f44336' }} />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f44336' }}>
                      {t.penaltyTokens}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      Penalty
                    </div>
                  </div>

                  <div
                    style={styles.metricBox('#ff9520')}
                    title="Deadline"
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>
                      <AccessTime style={{ color: '#ff9520' }} />
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ff9520' }}>
                      {t.deadlineDays}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      Days
                    </div>
                  </div>
                </div>

                {/* Tasks Section */}
                <div>
                  <h4 style={{
                    fontWeight: 'bold',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',

                  }}>
                    Tasks & Requirements
                  </h4>

                  <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                    {(t.tasks || []).sort((a, b) => a.order - b.order).map((task, taskIndex) => (
                      <div key={task.order} style={styles.taskBox}>
                        <div style={{
                          fontWeight: 'bold',
                          marginBottom: 8,
                          display: 'flex',

                          alignItems: 'center'
                        }}>
                          <div style={styles.taskNumber}>
                            {task.order}
                          </div>
                          {task.title}
                        </div>

                        {task.criteria && (
                          <div style={{ marginTop: 16 }}>
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 8
                            }}>
                              {Object.entries(task.criteria).map(([key, value]) => {
                                if (value == null) return null;

                                const getText = (k, v) => {
                                  const textMap = {
                                    sourceCity: `From ${v}`,
                                    destinationCity: `To ${v}`,
                                    cargoName: `Cargo: ${v}`,
                                    minDistance: `Min ${v} km`,
                                    maxDamagePct: `Cargo dmg ≤ ${v}%`,
                                    maxTopSpeedKmh: `Top speed ≤ ${v} km/h`,
                                    minAvgSpeedKmh: `Avg speed ≥ ${v} km/h`,
                                    maxAvgSpeedKmh: `Avg speed ≤ ${v} km/h`,
                                    minRevenue: `Revenue ≥ ${v}`,
                                    maxTruckDamagePercent: `Truck dmg ≤ ${v}%`,
                                    maxTrailerDamagePercent: `Trailer dmg ≤ ${v}%`
                                  };
                                  return textMap[k] || `${k}: ${v}`;
                                };

                                return (
                                  <span
                                    key={key}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      padding: '4px 8px',
                                      borderRadius: 16,
                                      fontSize: '0.9rem',

                                      backdropFilter: 'blur(10px)',
                                      border: '1px solid rgba(102,126,234,0.2)',
                                      transition: 'all 0.2s',
                                      cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = 'scale(1.05)';
                                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = 'scale(1)';
                                      e.target.style.boxShadow = 'none';
                                    }}
                                  >
                                    {getCriteriaIcon(key)}
                                    {getText(key, value)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 24px 24px' }}>
                {ownedTemplateIds.includes(t._id) ? (
                  <div
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      borderRadius: 12,
                      background: 'linear-gradient(45deg, #2e7d32 0%, #388e3c 100%)',
                      boxShadow: '0 6px 20px rgba(46,125,50,0.4)',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: 'white',
                      border: 'none',
                      textAlign: 'center'
                    }}
                  >
                    Active
                  </div>
                ) : (
                  <button
                    onClick={() => onBuy(t._id)}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      borderRadius: 12,
                      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)';
                      e.target.style.boxShadow = '0 8px 25px rgba(102,126,234,0.6)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Purchase Contract for {t.priceTokens} tokens
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && !loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh'
          }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🚛</div>
            <h3 style={{
              color: 'white',
              marginBottom: 8,
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '2rem'
            }}>
              No Contracts Available
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              maxWidth: 400,
              margin: 0
            }}>
              Check back soon for new delivery contracts and exciting opportunities!
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}