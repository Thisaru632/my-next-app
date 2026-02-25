'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  CardTravel as PackageIcon,
  ThumbUp as SatisfactionIcon,
  Star as StarIcon,
  Handshake as HandshakeIcon,
  Nature as EcoIcon,
  Favorite as HeartIcon,
  FlightTakeoff as AirportIcon,
  AutoAwesome as DiamondIcon,
  Security as SecurityIcon,
  DirectionsCar,
} from '@mui/icons-material';

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const stats = [
    { number: '7+', label: 'Years Experience', icon: <TrophyIcon /> },
    { number: '10,000+', label: 'Happy Travelers', icon: <GroupIcon /> },
    { number: '1,000+', label: 'Registered Vehicles', icon: <DirectionsCar sx={{ fontSize: 28 }} /> },
    { number: '24/7', label: 'Customer Support', icon: <SatisfactionIcon /> }
  ];

  const team = [
    {
      name: 'Udara Sampath Liyanage',
      role: 'Founder & Managing Director',
      avatar: 'UL',
      image: '/about/3.jpeg',
      bio: 'A dynamic entrepreneur with a visionary outlook, Mr. Liyanage founded Senu Cabs & Tours with a commitment to redefining travel and transport services across Sri Lanka.',
      color: '#0d9488'
    },
    {
      name: 'Amara Silva',
      role: 'Operations Manager',
      avatar: 'AS',
      bio: 'Expert in logistics and customer service, ensuring seamless travel experiences.',
      color: '#3b82f6'
    },
    {
      name: 'Kasun Fernando',
      role: 'Tour Designer',
      avatar: 'KF',
      bio: 'Crafting unique itineraries that showcase the best of Sri Lankan culture and nature.',
      color: '#8b5cf6'
    },

  ];

  const milestones = [
    { year: '2018', event: 'Senu Cabs & Tours was founded by Mr. Udara Sampath Liyanage with a vision for excellence' },
    { year: '2020', event: 'Expanded fleet significantly to meet growing demand for reliable transport' },
    { year: '2022', event: 'Evolved into a large-scale mobility provider serving island-wide travelers' },
    { year: '2024', event: 'Became a total solution provider for both local and international travelers' },
    { year: '2025', event: 'Continuing our commitment to providing safe, reliable, and premium travel experiences' }
  ];

  const whyChooseUs = [
    {
      icon: <DirectionsCar sx={{ fontSize: 60 }} />,
      title: 'Unmatched Fleet',
      description: 'We maintain a robust, island-wide fleet of over 1,000 vehicles. From luxury cars and comfortable passenger vans to large buses for group tours.'
    },
    {
      icon: <GroupIcon sx={{ fontSize: 60 }} />,
      title: 'Professional Drivers',
      description: 'Our drivers are well trained, uniformed, and courteous, keeping your safety and comfort as their highest priority.'
    },
    {
      icon: <DiamondIcon sx={{ fontSize: 60 }} />,
      title: 'Transparent & Hassle-Free',
      description: 'We provide vehicles with drivers and fuel included, ensuring there are no hidden charges throughout your journey.'
    },
    {
      icon: <EcoIcon sx={{ fontSize: 60 }} />,
      title: 'Value for Long Journeys',
      description: 'We offer the most competitive rates in the market for long-distance trips, ensuring peace of mind throughout your vacation.'
    },
    {
      icon: <AirportIcon sx={{ fontSize: 60 }} />,
      title: 'Seamless Airport Transfers',
      description: 'We provide 24/7 airport pickup and drop services, so your Sri Lankan adventure begins and ends smoothly without delays.'
    }
  ];

  const coreValues = [
    { title: 'Customer First', desc: 'We design every journey around our clients\' convenience.', icon: <HeartIcon sx={{ color: '#0d9488' }} /> },
    { title: 'Professionalism', desc: 'Our support staff and drivers deliver high quality, courteous service.', icon: <TrophyIcon sx={{ color: '#0d9488' }} /> },
    { title: 'Safety & Reliability', desc: 'Every vehicle is maintained in top condition with full insurance coverage, ensuring a safe trip every time.', icon: <SecurityIcon sx={{ color: '#0d9488' }} /> },
    { title: 'Flexibility', desc: 'We offer flexible, customizable packages to suit your specific itinerary.', icon: <EcoIcon sx={{ color: '#0d9488' }} /> }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          height: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url(/about/2.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box textAlign="center" color="white" sx={{
              textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
              padding: 4,
              borderRadius: 2
            }}>
              <Typography variant={isMobile ? 'h3' : 'h2'} fontWeight="bold" gutterBottom>
                Discover the Beauty of Sri Lanka with Senu Cabs & Tours
              </Typography>
              <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ mb: 4, fontWeight: 300 }}>
                Your Trusted Transport Partner Since 2018
              </Typography>
              <Box sx={{ width: 100, height: 4, bgcolor: '#14b8a6', mx: 'auto' }} />
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 4
          }}
        >
          {stats.map((stat, index) => (
            <Zoom in timeout={500 + index * 100} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ color: '#0d9488', mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h3" fontWeight="bold" color="#0d9488" gutterBottom>
                  {stat.number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Zoom>
          ))}
        </Box>
      </Container>

      {/* Tabs Section - Story/Mission/Vision */}
      <Box sx={{ bgcolor: '#f8fafc', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              centered={!isMobile}
              variant={isMobile ? 'fullWidth' : 'standard'}
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none'
                }
              }}
            >
              <Tab label="Our Story" />
              <Tab label="Our Mission" />
              <Tab label="Our Vision" />
              <Tab label="Core Values" />
            </Tabs>
          </Box>

          <Fade in key={activeTab} timeout={500}>
            <Paper elevation={4} sx={{ p: { xs: 3, md: 6 } }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Our Story
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary', textAlign: 'justify' }}>
                    Established in 2018, Senu Cabs & Tours has grown into a trusted name in the Sri Lankan transport industry. What began as a small-scale service has rapidly evolved into a large-scale mobility provider known for reliability, safety, and a customer-focused approach.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary', textAlign: 'justify' }}>
                    Founded by Mr. Udara Sampath Liyanage, a dynamic entrepreneur with a visionary outlook, our company is committed to redefining travel and transport services across the island. His leadership has been the driving force behind our rapid growth and reputation for excellence.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary', textAlign: 'justify' }}>
                    Today, we are proud to be a total solution provider, adapting to the diverse needs of both local holidaymakers and international travelers exploring our beautiful country. Our success is built on the foundation of trust we have earned from our clients through years of dedicated service.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', textAlign: 'justify' }}>
                    Whether you are seeking a quick airport transfer or an extensive island-wide tour, we continue our journey with the same passion that started it all: ensuring every traveler experiences the best of Sri Lanka with comfort and peace of mind.
                  </Typography>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Our Mission
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3, color: '#0d9488', fontWeight: 600 }}>
                    To provide convenient, affordable, and customized vehicle services with professionalism and care, while continuously upgrading our services to meet the evolving needs of our travelers.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                    We believe travel is more than just visiting places—its about creating meaningful connections, understanding different cultures, and making memories that last a lifetime. Our mission is to:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {[
                      'Provide exceptional, personalized service that exceeds expectations at every touchpoint',
                      'Showcase the true essence of Sri Lankan culture, nature, and hospitality',
                      'Support local communities and practice sustainable tourism',
                      'Ensure safety, comfort, and peace of mind for every traveler',
                      'Create employment opportunities and contribute to Sri Lanka\'s tourism industry'
                    ].map((item, idx) => (
                      <Typography key={idx} component="li" variant="body1" sx={{ mb: 2, lineHeight: 1.8, color: 'text.secondary' }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', mt: 2 }}>
                    Every decision we make, every service we offer, and every interaction we have is guided by this mission to be more than just a tour operator—to be your trusted partner in discovering Sri Lanka.
                  </Typography>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Our Vision
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3, color: '#0d9488', fontWeight: 600 }}>
                    To be the most dependable and customer-preferred transport solutions provider in Sri Lanka recognized for safety, innovation, and excellence.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                    We envision a future where Senu Cabs & Tours is synonymous with exceptional Sri Lankan experiences. Our goal is to set the gold standard in the mobility industry, ensuring that every passenger—whether a local commuter or an international explorer—receives the highest level of care and reliability.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                    By continuously integrating modern technology, maintaining a world-class fleet, and fostering a culture of service excellence, we aim to be the first choice for anyone seeking to discover the wonders of Sri Lanka.
                  </Typography>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Our Core Values
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3, color: '#0d9488', fontWeight: 600 }}>
                    The principles that guide our journey and define our commitment to you.
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                      gap: 3,
                      mt: 2
                    }}
                  >
                    {coreValues.map((value, idx) => (
                      <Paper elevation={2} sx={{ p: 3, height: '100%', bgcolor: '#f0fdfa', borderRadius: '16px', border: '1px solid rgba(13,148,136,0.1)' }} key={idx}>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          {value.icon}
                          <Typography variant="subtitle1" fontWeight="bold" color="#2D231B">
                            {value.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {value.desc}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Fade>
        </Container>
      </Box>

      {/* Timeline Section */}
      <Box sx={{ bgcolor: '#f8fafc', py: 8 }}>
        <Container maxWidth="md">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Our Journey
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Milestones that shaped who we are today
            </Typography>
          </Box>

          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 4,
                bgcolor: '#0d9488',
                transform: 'translateX(-50%)',
                display: { xs: 'none', md: 'block' }
              }}
            />

            {milestones.map((milestone, index) => (
              <Fade in timeout={500 + index * 100} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                    mb: 4,
                    position: 'relative'
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      maxWidth: { xs: '100%', md: '45%' },
                      position: 'relative'
                    }}
                  >
                    <Chip
                      label={milestone.year}
                      color="primary"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        bgcolor: '#0d9488'
                      }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      {milestone.event}
                    </Typography>
                  </Paper>

                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: '#0d9488',
                      border: '4px solid white',
                      boxShadow: 2,
                      display: { xs: 'none', md: 'block' }
                    }}
                  />
                </Box>
              </Fade>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Team Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Meet Our Team
          </Typography>
          <Typography variant="h6" color="text.secondary">
            The passionate people behind your perfect journey
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 4,
            justifyContent: 'center',
            maxWidth: '1000px',
            mx: 'auto'
          }}
        >
          {team.map((member, index) => (
            <Zoom in timeout={500 + index * 100} key={index}>
              <Card
                elevation={3}
                sx={{
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 8
                  }
                }}
              >
                <Box sx={{ pt: 4, pb: 2 }}>
                  {member.image ? (
                    <Box
                      component="img"
                      src={member.image}
                      alt={member.name}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `4px solid ${member.color}`,
                        boxShadow: 3
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: member.color,
                        fontSize: '2.5rem',
                        fontWeight: 'bold'
                      }}
                    >

                      {member.avatar}
                    </Avatar>
                  )}
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {member.name}
                  </Typography>
                  <Chip
                    label={member.role}
                    size="small"
                    sx={{ mb: 2, bgcolor: member.color, color: 'white' }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {member.bio}
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          ))}
        </Box>
      </Container>

      {/* Why Choose Us Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Why Travel With Us?
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Whether you are planning a short day trip or an extensive island-wide tour, we build services that fit your unique needs.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
              mb: 8
            }}
          >
            {whyChooseUs.map((item, index) => (
              <Paper
                key={index}
                elevation={4}
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {item.icon}
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {item.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Ready to Start Your Journey?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Lets create unforgettable memories together in beautiful Sri Lanka
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            href="/all_packages"
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: '#0d9488',
              '&:hover': {
                bgcolor: '#0f766e'
              },
              textTransform: 'none',
              fontSize: '1.1rem',
              borderRadius: 8
            }}
          >
            Explore Our Tours
          </Button>
          <Button
            variant="outlined"
            size="large"
            href="/contact-us"
            sx={{
              px: 4,
              py: 1.5,
              borderColor: '#0d9488',
              color: '#0d9488',
              '&:hover': {
                borderColor: '#0f766e',
                bgcolor: 'rgba(13, 148, 136, 0.04)'
              },
              textTransform: 'none',
              fontSize: '1.1rem',
              borderRadius: 8
            }}
          >
            Contact Us
          </Button>
        </Box>
      </Container>
    </Box>
  );
}