// app/all_packages/filters.tsx

"use client"

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Divider,
  Paper,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  DirectionsCar,
  DirectionsBus,
  LocationOn,
  CalendarToday,
  Schedule,
  Person,
  Phone,
  Email,
  Close as CloseIcon,
  DriveEta,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle,
  AirportShuttle,
  LocalTaxi,
  EventAvailable,
  AccessTime,
  Luggage,
  AcUnit,
  CreditCard,
  Groups,
  TripOrigin,
  FlagCircle,
  ArrowForward,
} from '@mui/icons-material';

// Updated vehicle types with gradient backgrounds and better styling
const vehicleTypes = [
  { 
    name: 'Car', 
    icon: <DriveEta sx={{ fontSize: 40 }} />, 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  { 
    name: 'Van', 
    icon: <AirportShuttle sx={{ fontSize: 40 }} />, 
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  { 
    name: 'Bus', 
    icon: <DirectionsBus sx={{ fontSize: 40 }} />, 
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  { 
    name: 'SUV', 
    icon: <LocalTaxi sx={{ fontSize: 40 }} />, 
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
  },
];

// Vehicle specifications
const vehicleSpecs = {
  Car: { passengers: 3, baggage: 'Limited baggage', luggageCount: '2-3 bags' },
  Van: { passengers: 10, baggage: 'Medium baggage', luggageCount: '6-8 bags' },
  Bus: { passengers: 29, baggage: 'Large baggage', luggageCount: '15-20 bags' },
  SUV: { passengers: 4, baggage: 'Large baggage', luggageCount: '4-5 bags' },
};

// Trip types with icons
const tripTypes = [
  { 
    name: 'Drop', 
    description: 'Single destination trip',
    icon: <FlagCircle sx={{ fontSize: 32, color: '#667eea' }} />
  },
  { 
    name: 'Return', 
    description: 'Return to starting point',
    icon: <TripOrigin sx={{ fontSize: 32, color: '#f093fb' }} />
  },
];

const sampleVehicles = {
  Car: {
    models: [
      { name: 'Alto', description: 'Compact & Efficient' },
      { name: 'Wagon R', description: 'Spacious Interior' },
      { name: 'Aqua', description: 'Hybrid Technology' },
      { name: 'Axio', description: 'Premium Comfort' },
    ]
  },
  Van: {
    models: [
      { name: 'KDH High Roof', description: 'Extra headroom' },
      { name: 'KDH Flat Roof', description: 'Classic style' },
      { name: 'Dual AC Van', description: 'Dual climate control' },
      { name: 'Non-AC Van', description: 'Budget friendly' },
    ]
  },
  Bus: {
    models: [
      { name: 'AC 29 Seater', description: 'Air conditioned comfort' },
      { name: 'Non-AC 29 Seater', description: 'Economical choice' }, 
    ]
  },
  SUV: {
    models: [
      { name: 'Prado', description: 'Luxury 4x4' },
      { name: 'Fortuner', description: 'Premium SUV' }, 
    ]
  },
};

export default function BookingForm() {
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleName: '',
    tripType: '',
    pickupLocation: '',
    dropoffLocation: '',
    destinations: [] as string[],
    dateTime: '',
    numberOfDays: 1,
    name: '',
    telephone: '',
    email: '',
  });

  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [openTripTypeDialog, setOpenTripTypeDialog] = useState(false);
  const [openPersonalDialog, setOpenPersonalDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newDestination, setNewDestination] = useState('');

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddDestination = () => {
    if (newDestination.trim()) {
      setFormData((prev) => ({
        ...prev,
        destinations: [...prev.destinations, newDestination.trim()]
      }));
      setNewDestination('');
    }
  };

  const handleRemoveDestination = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index)
    }));
  };

  const handleVehicleCardClick = (type: string) => {
    setSelectedCategory(type);
    setOpenVehicleDialog(true);
  };

  const handleVehicleSelect = (modelName: string) => {
    setFormData((prev) => ({
      ...prev,
      vehicleType: selectedCategory,
      vehicleName: modelName,
    }));
    setOpenVehicleDialog(false);
    setOpenTripTypeDialog(true);
  };

  const handleTripTypeSelect = (tripTypeName: string) => {
    setFormData((prev) => ({
      ...prev,
      tripType: tripTypeName,
    }));
    setOpenTripTypeDialog(false);
  };

  const handleRequestBooking = () => {
    if (!formData.vehicleName || !formData.tripType || !formData.pickupLocation || !formData.dropoffLocation || !formData.dateTime) {
      alert('Please fill all required fields');
      return;
    }
    setOpenPersonalDialog(true);
  };

  const handleSendRequest = () => {
    console.log('Booking request submitted:', formData);
    alert('Booking request sent successfully!');
    setOpenPersonalDialog(false);
  };

  const currentCategoryVehicles = sampleVehicles[selectedCategory as keyof typeof sampleVehicles] || { models: [] };

  const basePricePerDay =
    formData.vehicleType === 'Car' ? 15000 :
    formData.vehicleType === 'Van' ? 18000 :
    formData.vehicleType === 'Bus' ? 35000 :
    formData.vehicleType === 'SUV' ? 25000 : 0;

  const totalPrice = basePricePerDay * formData.numberOfDays;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }} suppressHydrationWarning>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Book Your Journey
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose your perfect ride and create unforgettable experiences
        </Typography>
      </Box>

      {/* Vehicle Selection Section */}
      <Paper 
        elevation={3}
        sx={{ 
          borderRadius: 4, 
          p: 4, 
          mb: 4,
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Select Your Vehicle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose from our premium fleet
            </Typography>
          </Box>
          
          {totalPrice > 0 && (
            <Chip 
              label={`Estimated: LKR ${totalPrice.toLocaleString()}`}
              icon={<CreditCard />}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                py: 2.5,
                px: 1,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          )}
        </Box>

        {/* Vehicle Cards Grid */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 4
        }}>
          {vehicleTypes.map((vehicle) => (
            <Tooltip key={vehicle.name} title={`Select ${vehicle.name}`} arrow>
              <Card
                onClick={() => handleVehicleCardClick(vehicle.name)}
                sx={{
                  cursor: 'pointer',
                  border: formData.vehicleType === vehicle.name ? `3px solid ${vehicle.color}` : '3px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${vehicle.color}40`,
                  },
                  '&::before': formData.vehicleType === vehicle.name ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: vehicle.gradient,
                  } : {},
                }}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  '&:last-child': { pb: 3 }
                }}>
                  <Box sx={{ 
                    mb: 2,
                    color: formData.vehicleType === vehicle.name ? vehicle.color : '#666',
                    transform: formData.vehicleType === vehicle.name ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s'
                  }}>
                    {vehicle.icon}
                  </Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: formData.vehicleType === vehicle.name ? vehicle.color : '#424242'
                    }}
                  >
                    {vehicle.name}
                  </Typography>
                  {formData.vehicleType === vehicle.name && (
                    <CheckCircle 
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: vehicle.color,
                        fontSize: 24
                      }} 
                    />
                  )}
                </CardContent>
              </Card>
            </Tooltip>
          ))}
        </Box>

        {/* Vehicle Features */}
        {formData.vehicleType && (
          <Fade in={true}>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
              p: 3,
              background: 'rgba(102, 126, 234, 0.05)',
              borderRadius: 3,
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CreditCard sx={{ color: '#667eea', fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Payment
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Flexible
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AcUnit sx={{ color: '#4facfe', fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Climate
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Air Conditioned
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Groups sx={{ color: '#f093fb', fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Capacity
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {vehicleSpecs[formData.vehicleType as keyof typeof vehicleSpecs]?.passengers || 3} Passengers
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Luggage sx={{ color: '#43e97b', fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Luggage
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {vehicleSpecs[formData.vehicleType as keyof typeof vehicleSpecs]?.luggageCount || '2-3 bags'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        )}

        {/* Selected Items Display */}
        {(formData.vehicleName || formData.tripType) && (
          <Fade in={true}>
            <Box sx={{ 
              mt: 4, 
              pt: 4, 
              borderTop: '2px dashed #e0e0e0',
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              {formData.vehicleName && (
                <Chip
                  icon={formData.vehicleType === 'Van' ? <AirportShuttle /> :
                        formData.vehicleType === 'Bus' ? <DirectionsBus /> :
                        formData.vehicleType === 'SUV' ? <LocalTaxi /> :
                        <DriveEta />}
                  label={`${formData.vehicleType} - ${formData.vehicleName}`}
                  onDelete={() => handleVehicleCardClick(formData.vehicleType)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 500,
                    py: 2.5,
                    px: 1,
                    '& .MuiChip-icon': { color: 'white' },
                    '& .MuiChip-deleteIcon': { color: 'white', '&:hover': { color: '#f0f0f0' } }
                  }}
                />
              )}

              {formData.tripType && (
                <Chip
                  icon={<CheckCircle />}
                  label={`${formData.tripType} Trip`}
                  onDelete={() => setOpenTripTypeDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    fontWeight: 500,
                    py: 2.5,
                    px: 1,
                    '& .MuiChip-icon': { color: 'white' },
                    '& .MuiChip-deleteIcon': { color: 'white', '&:hover': { color: '#f0f0f0' } }
                  }}
                />
              )}
            </Box>
          </Fade>
        )}
      </Paper>

      {/* Trip Details Section */}
      <Paper 
        elevation={3}
        sx={{ 
          borderRadius: 4, 
          p: 4,
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Trip Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Plan your journey with multiple stops
        </Typography>

        <Stack spacing={3}>
          {/* Pickup Location */}
          <TextField
            label="Pickup Location"
            placeholder="Enter your starting point"
            value={formData.pickupLocation}
            onChange={(e) => handleChange('pickupLocation', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TripOrigin sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 },
              }
            }}
          />

          {/* Multiple Destinations */}
          {formData.destinations.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                Stops Along the Way ({formData.destinations.length})
              </Typography>
              <Stack spacing={1.5}>
                {formData.destinations.map((destination, index) => (
                  <Paper
                    key={index}
                    elevation={1}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 3 }
                    }}
                  >
                    <Box sx={{ 
                      minWidth: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}>
                      {index + 1}
                    </Box>
                    <Typography variant="body1" sx={{ flex: 1 }}>
                      {destination}
                    </Typography>
                    <IconButton 
                      onClick={() => handleRemoveDestination(index)}
                      size="small"
                      sx={{
                        color: '#f5576c',
                        '&:hover': { background: 'rgba(245, 87, 108, 0.1)' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* Add Destination */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Add Stop (Optional)"
              placeholder="Add intermediate destinations"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDestination();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: '#4facfe' }} />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#4facfe' },
                  '&.Mui-focused fieldset': { borderColor: '#4facfe', borderWidth: 2 },
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddDestination}
              disabled={!newDestination.trim()}
              startIcon={<AddIcon />}
              sx={{
                minWidth: 120,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3d9ce8 0%, #00d9e8 100%)',
                }
              }}
            >
              Add
            </Button>
          </Box>

          {/* Dropoff Location */}
          <TextField
            label="Dropoff Location"
            placeholder="Enter your final destination"
            value={formData.dropoffLocation}
            onChange={(e) => handleChange('dropoffLocation', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FlagCircle sx={{ color: '#f5576c' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#f5576c' },
                '&.Mui-focused fieldset': { borderColor: '#f5576c', borderWidth: 2 },
              }
            }}
          />

          <Divider sx={{ my: 2 }} />

          {/* Date/Time and Days */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <TextField
              label="Date & Time"
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => handleChange('dateTime', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventAvailable sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 },
                }
              }}
            />

            <TextField
              label="Number of Days"
              type="number"
              value={formData.numberOfDays}
              onChange={(e) => handleChange('numberOfDays', Math.max(1, parseInt(e.target.value) || 1))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTime sx={{ color: '#f093fb' }} />
                  </InputAdornment>
                ),
                inputProps: { min: 1 }
              }}
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#f093fb' },
                  '&.Mui-focused fieldset': { borderColor: '#f093fb', borderWidth: 2 },
                }
              }}
            />
          </Box>

          {/* Submit Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleRequestBooking}
            disabled={!formData.vehicleName || !formData.tripType || !formData.pickupLocation || !formData.dropoffLocation || !formData.dateTime}
            endIcon={<ArrowForward />}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: '#e0e0e0',
                color: '#9e9e9e'
              },
              transition: 'all 0.3s'
            }}
          >
            Request Booking
          </Button>
        </Stack>
      </Paper>

      {/* Vehicle Selection Dialog */}
      <Dialog 
        open={openVehicleDialog} 
        onClose={() => setOpenVehicleDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: vehicleTypes.find(v => v.name === selectedCategory)?.gradient || '#667eea',
          color: 'white',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedCategory === 'Van' && <AirportShuttle />}
            {selectedCategory === 'Bus' && <DirectionsBus />}
            {selectedCategory === 'Car' && <DriveEta />}
            {selectedCategory === 'SUV' && <LocalTaxi />}
            Select {selectedCategory} Vehicle
          </Box>
          <IconButton
            onClick={() => setOpenVehicleDialog(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose from our available {selectedCategory} vehicles
          </Typography>
          <List disablePadding>
            {currentCategoryVehicles?.models.map((model, index) => (
              <Paper
                key={model.name}
                elevation={formData.vehicleName === model.name ? 3 : 1}
                sx={{
                  mb: 1.5,
                  overflow: 'hidden',
                  border: formData.vehicleName === model.name ? '2px solid' : '1px solid',
                  borderColor: formData.vehicleName === model.name ? 
                    vehicleTypes.find(v => v.name === selectedCategory)?.color : '#e0e0e0',
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <ListItemButton
                  onClick={() => handleVehicleSelect(model.name)}
                  sx={{ py: 2, px: 3 }}
                >
                  <ListItemText 
                    primary={model.name}
                    secondary={model.description}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  {formData.vehicleName === model.name && (
                    <CheckCircle sx={{ 
                      color: vehicleTypes.find(v => v.name === selectedCategory)?.color,
                      fontSize: 28
                    }} />
                  )}
                </ListItemButton>
              </Paper>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Trip Type Dialog */}
      <Dialog 
        open={openTripTypeDialog} 
        onClose={() => setOpenTripTypeDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TripOrigin />
            Select Trip Type
          </Box>
          <IconButton
            onClick={() => setOpenTripTypeDialog(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose the type of trip you are planning
          </Typography>
          <List disablePadding>
            {tripTypes.map((trip) => (
              <Paper
                key={trip.name}
                elevation={formData.tripType === trip.name ? 3 : 1}
                sx={{
                  mb: 1.5,
                  overflow: 'hidden',
                  border: formData.tripType === trip.name ? '2px solid #f093fb' : '1px solid #e0e0e0',
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <ListItemButton
                  onClick={() => handleTripTypeSelect(trip.name)}
                  sx={{ py: 2.5, px: 3 }}
                >
                  <Box sx={{ mr: 2 }}>
                    {trip.icon}
                  </Box>
                  <ListItemText 
                    primary={trip.name}
                    secondary={trip.description}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }}
                  />
                  {formData.tripType === trip.name && (
                    <CheckCircle sx={{ color: '#f093fb', fontSize: 28 }} />
                  )}
                </ListItemButton>
              </Paper>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Personal Information Dialog */}
      <Dialog 
        open={openPersonalDialog} 
        onClose={() => setOpenPersonalDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person />
            Your Information
          </Box>
          <IconButton
            onClick={() => setOpenPersonalDialog(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Please provide your contact details to complete your booking
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#43e97b' }} />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#43e97b' },
                  '&.Mui-focused fieldset': { borderColor: '#43e97b', borderWidth: 2 },
                }
              }}
            />

            <TextField
              label="Telephone"
              placeholder="Enter your phone number"
              value={formData.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: '#4facfe' }} />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#4facfe' },
                  '&.Mui-focused fieldset': { borderColor: '#4facfe', borderWidth: 2 },
                }
              }}
            />

            <TextField
              label="Email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#f093fb' }} />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#f093fb' },
                  '&.Mui-focused fieldset': { borderColor: '#f093fb', borderWidth: 2 },
                }
              }}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSendRequest}
              disabled={!formData.name || !formData.telephone || !formData.email}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                boxShadow: '0 4px 15px rgba(67, 233, 123, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3bd46d 0%, #2fe0c9 100%)',
                  boxShadow: '0 6px 20px rgba(67, 233, 123, 0.5)',
                },
                transition: 'all 0.3s'
              }}
            >
              Confirm & Send Request
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}