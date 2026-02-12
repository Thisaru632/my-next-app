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
} from '@mui/icons-material';

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const stats = [
    { number: '15+', label: 'Years Experience', icon: <TrophyIcon /> },
    { number: '5000+', label: 'Happy Travelers', icon: <GroupIcon /> },
    { number: '50+', label: 'Tour Packages', icon: <PackageIcon /> },
    { number: '100%', label: 'Customer Satisfaction', icon: <SatisfactionIcon /> }
  ];

  const team = [
    {
      name: 'Senura Perera',
      role: 'Founder & CEO',
      avatar: 'SP',
      bio: 'With over 15 years in hospitality, Senura founded Senu Tours to share his passion for Sri Lanka.',
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
    {
      name: 'Dilini Jayawardena',
      role: 'Guest Relations',
      avatar: 'DJ',
      bio: 'Dedicated to making every guest feel at home from arrival to departure.',
      color: '#ec4899'
    }
  ];

  const milestones = [
    { year: '2010', event: 'Senu Tours was founded with a single vehicle and a big dream' },
    { year: '2013', event: 'Expanded fleet to 10 vehicles, serving 500+ annual travelers' },
    { year: '2016', event: 'Launched luxury tour packages and corporate travel services' },
    { year: '2019', event: 'Reached 3000+ satisfied customers milestone' },
    { year: '2022', event: 'Introduced sustainable tourism initiatives and eco-friendly practices' },
    { year: '2025', event: 'Celebrating 15 years of excellence with 5000+ happy travelers' }
  ];

  const whyChooseUs = [
    {
      icon: <AirportIcon sx={{ fontSize: 60 }} />,
      title: 'Local Expertise',
      description: 'Born and raised in Sri Lanka, we know every hidden gem, authentic restaurant, and breathtaking viewpoint that guidebooks miss.'
    },
    {
      icon: <DiamondIcon sx={{ fontSize: 60 }} />,
      title: 'Personalized Service',
      description: 'No cookie-cutter tours here. We customize every journey to match your interests, pace, and preferences perfectly.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 60 }} />,
      title: 'Safety First',
      description: 'Modern vehicles, professional drivers, comprehensive insurance, and 24/7 support ensure your peace of mind throughout your journey.'
    }
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
                Your Journey, Our Passion
              </Typography>
              <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ mb: 4, fontWeight: 300 }}>
                Crafting unforgettable Sri Lankan experiences since 2010
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
            </Tabs>
          </Box>

          <Fade in key={activeTab} timeout={500}>
            <Paper elevation={4} sx={{ p: { xs: 3, md: 6 } }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Our Story
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                    Senu Tours was born from a simple yet profound love for Sri Lanka and a desire to share its magic with the world. Founded in 2010 by Senura Perera, what started as a one-vehicle operation has blossomed into one of Sri Lankas most trusted travel companions.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                    Growing up in the heart of Sri Lanka, Senura witnessed firsthand the islands breathtaking diversity—from misty mountain peaks to sun-kissed beaches, ancient temples to vibrant cities. He dreamed of creating a service that wouldnt just transport visitors, but would transform their journey into a deeply personal experience.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                    Over the years, Senu Tours has grown, but our core values remain unchanged. Were not just a tour company; were your local friends, your cultural guides, and your gateway to authentic Sri Lankan hospitality. Every journey we craft is infused with the warmth, care, and attention to detail that has become our signature.
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                    Today, with a fleet of modern vehicles, a team of passionate professionals, and thousands of happy memories created, we continue our mission: to make every traveler feel at home while exploring the wonders of our beautiful island.
                  </Typography>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Our Mission
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 3, color: '#0d9488', fontWeight: 600 }}>
                    To create transformative travel experiences that connect people with the authentic heart of Sri Lanka.
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
                    To be Sri Lankas most beloved and trusted travel companion, recognized globally for excellence, authenticity, and sustainable tourism.
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                    We envision a future where Senu Tours is synonymous with exceptional Sri Lankan experiences. A future where:
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                      gap: 3,
                      mt: 2
                    }}
                  >
                    {[
                      { title: '🌍 Global Recognition', desc: 'Travelers worldwide choose Senu Tours as their first choice for exploring Sri Lanka, recommended by friends and recognized for our unwavering commitment to quality.' },
                      { title: '🌿 Sustainability Leadership', desc: 'We lead the industry in eco-friendly practices, protecting Sri Lanka\'s natural beauty while supporting local communities and creating positive environmental impact.' },
                      { title: '✨ Innovation in Travel', desc: 'We continuously innovate, incorporating technology and creative solutions to enhance the travel experience while maintaining the personal touch that makes us special.' },
                      { title: '❤️ Community Impact', desc: 'Our success translates directly into thriving local communities, empowered employees, and preserved cultural heritage for future generations.' }
                    ].map((vision, idx) => (
                      <Paper elevation={2} sx={{ p: 3, height: '100%', bgcolor: '#f0fdfa' }} key={idx}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {vision.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {vision.desc}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', mt: 3 }}>
                    This vision drives us forward every day, inspiring us to raise the bar, challenge ourselves, and never settle for anything less than extraordinary.
                  </Typography>
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
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 4
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
              Why Choose Senu Tours?
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Experience the difference that makes us Sri Lankas trusted travel partner
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4
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