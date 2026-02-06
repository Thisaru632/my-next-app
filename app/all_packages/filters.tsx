// components/BookingForm.tsx
// ──────────────────────────────────────────────────────────────
// FIXED VERSION - Emotion Hydration mismatch should be gone
// after adding AppRouterCacheProvider in layout + next.config.js
// ──────────────────────────────────────────────────────────────

'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  alpha,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Collapse,
} from '@mui/material';
import {
  Car,
  Truck,
  Bus,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  ArrowRight,
  ChevronLeft,
  CheckCircle,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  X,
} from 'lucide-react';
import { styled } from '@mui/material/styles';

/* ================= TYPES ================= */

type FormField =
  | 'vehicleType'
  | 'vehicleName'
  | 'pickupLocation'
  | 'dropoffLocation'
  | 'dateTime'
  | 'name'
  | 'telephone'
  | 'email';

interface FormData {
  vehicleType: string;
  vehicleName: string;
  pickupLocation: string;
  dropoffLocation: string;
  dateTime: string;
  name: string;
  telephone: string;
  email: string;
}

interface VehicleModel {
  id: string;
  name: string;
}

interface VehicleType {
  name: string;
  icon: JSX.Element;
  maxPassengers: number;
  maxBags: number;
  pricePerDay: number;
  models: VehicleModel[];
}

/* ================= STYLED COMPONENTS ================= */

const GradientBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.3)} 50%, ${alpha(theme.palette.secondary.light, 0.2)} 100%)`,
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
}));

const VehicleCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: selected ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
  position: 'relative',
  height: '140px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
    borderColor: selected ? theme.palette.primary.main : theme.palette.grey[400],
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  boxShadow: theme.shadows[8],
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: `2px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[3],
  position: 'sticky',
  top: theme.spacing(2),
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(1.5),
  fontWeight: 600,
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[8],
  },
}));

const SuccessButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
  color: '#fff',
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(1.5),
  fontWeight: 600,
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.success.dark} 30%, ${theme.palette.success.main} 90%)`,
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[8],
  },
}));

/* ================= COMPONENT ================= */

export default function BookingForm() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [numberOfDays, setNumberOfDays] = useState<number>(1);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const steps = ['Trip Details', 'Personal Info'];

  const [formData, setFormData] = useState<FormData>({
    vehicleType: 'Budget',
    vehicleName: '',
    pickupLocation: 'BIA Arrival Terminal, Katunayake',
    dropoffLocation: '',
    dateTime: '',
    name: '',
    telephone: '',
    email: '',
  });

  const vehicleTypes: VehicleType[] = [
    { 
      name: 'Budget', 
      icon: <Car size={40} />, 
      maxPassengers: 3, 
      maxBags: 2, 
      pricePerDay: 5000,
      models: [
        { id: 'alto', name: 'Suzuki Alto' },
        { id: 'wagon-r', name: 'Suzuki Wagon R' },
        { id: 'panda', name: 'Fiat Panda' },
      ]
    },
    { 
      name: 'City', 
      icon: <Car size={40} />, 
      maxPassengers: 4, 
      maxBags: 3, 
      pricePerDay: 7000,
      models: [
        { id: 'vitz', name: 'Toyota Vitz' },
        { id: 'aqua', name: 'Toyota Aqua' },
        { id: 'swift', name: 'Suzuki Swift' },
      ]
    },
    { 
      name: 'Semi', 
      icon: <Truck size={40} />, 
      maxPassengers: 2, 
      maxBags: 5, 
      pricePerDay: 8500,
      models: [
        { id: 'pickup', name: 'Toyota Hilux' },
        { id: 'dmax', name: 'Isuzu D-Max' },
        { id: 'ranger', name: 'Ford Ranger' },
      ]
    },
    { 
      name: 'Car', 
      icon: <Car size={40} />, 
      maxPassengers: 5, 
      maxBags: 4, 
      pricePerDay: 10000,
      models: [
        { id: 'axio', name: 'Toyota Axio' },
        { id: 'civic', name: 'Honda Civic' },
        { id: 'premio', name: 'Toyota Premio' },
        { id: 'allion', name: 'Toyota Allion' },
      ]
    },
    { 
      name: '9 Seater', 
      icon: <Bus size={40} />, 
      maxPassengers: 9, 
      maxBags: 6, 
      pricePerDay: 15000,
      models: [
        { id: 'kdh', name: 'Toyota KDH Van' },
        { id: 'noah', name: 'Toyota Noah' },
        { id: 'voxy', name: 'Toyota Voxy' },
      ]
    },
    { 
      name: '14 Seater', 
      icon: <Bus size={40} />, 
      maxPassengers: 14, 
      maxBags: 10, 
      pricePerDay: 20000,
      models: [
        { id: 'hiace', name: 'Toyota Hiace' },
        { id: 'caravan', name: 'Nissan Caravan' },
        { id: 'commuter', name: 'Toyota Commuter' },
      ]
    },
  ];

  const selectedVehicle = vehicleTypes.find(v => v.name === formData.vehicleType) || vehicleTypes[0];
  const totalPrice = selectedVehicle.pricePerDay * numberOfDays;

  const handleChange = (field: FormField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVehicleTypeChange = (vehicleType: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      vehicleType: vehicleType,
      vehicleName: '' // Reset vehicle name when category changes
    }));
  };

  const handleNext = () => {
    setOpenDialog(true);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', formData);
    console.log('Total Price:', totalPrice);
    console.log('Number of Days:', numberOfDays);
    alert(`Booking submitted successfully! Total: LKR ${totalPrice.toLocaleString()}`);
  };

  return (
    <GradientBox>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2 30%, #5e35b1 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Book Your Journey
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Choose your vehicle and complete your details in two easy steps
          </Typography>
        </Box>

        {/* Stepper */}
        <Box mb={4}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Form */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <StyledPaper elevation={3}>
              <form onSubmit={handleSubmit}>
                {/* STEP 1: Trip Details */}
                {activeStep === 0 && (
                  <Box>
                    {/* Section Title */}
                    <Box display="flex" alignItems="center" mb={3}>
                      <Box
                        sx={{
                          width: 4,
                          height: 28,
                          bgcolor: 'primary.main',
                          borderRadius: 1,
                          mr: 1.5,
                        }}
                      />
                      <Typography variant="h5" fontWeight="bold">
                        Select Your Vehicle
                      </Typography>
                    </Box>

                    {/* Vehicle Grid */}
                    <Grid container spacing={2} mb={4}>
                      {vehicleTypes.map((vehicle) => (
                        <Grid item xs={12} sm={6} md={4} key={vehicle.name}>
                          <VehicleCard
                            selected={formData.vehicleType === vehicle.name}
                            onClick={() => handleVehicleTypeChange(vehicle.name)}
                          >
                            <CardContent
                              sx={{
                                textAlign: 'center',
                                p: 2,
                                '&:last-child': { pb: 2 },
                              }}
                            >
                              <Box
                                sx={{
                                  color: formData.vehicleType === vehicle.name ? 'primary.main' : 'text.secondary',
                                  display: 'flex',
                                  justifyContent: 'center',
                                }}
                              >
                                {vehicle.icon}
                              </Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                mt={1}
                                color={formData.vehicleType === vehicle.name ? 'primary.main' : 'text.primary'}
                              >
                                {vehicle.name}
                              </Typography>
                              {formData.vehicleType === vehicle.name && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    color: 'primary.main',
                                  }}
                                >
                                  <CheckCircle size={24} />
                                </Box>
                              )}
                            </CardContent>
                          </VehicleCard>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Vehicle Models Selection */}
                    <Collapse in={formData.vehicleType !== ''}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          mb: 4, 
                          bgcolor: alpha('#1976d2', 0.03),
                          border: '1px solid',
                          borderColor: alpha('#1976d2', 0.2),
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" mb={2} color="primary">
                          Select Your {selectedVehicle.name} Vehicle
                        </Typography>
                        <FormControl component="fieldset" fullWidth>
                          <RadioGroup
                            value={formData.vehicleName}
                            onChange={(e) => handleChange('vehicleName', e.target.value)}
                          >
                            <Grid container spacing={1}>
                              {selectedVehicle.models.map((model) => (
                                <Grid item xs={12} sm={6} key={model.id}>
                                  <FormControlLabel
                                    value={model.name}
                                    control={<Radio />}
                                    label={model.name}
                                    sx={{
                                      border: '1px solid',
                                      borderColor: formData.vehicleName === model.name ? 'primary.main' : 'divider',
                                      borderRadius: 1.5,
                                      py: 1,
                                      px: 2,
                                      m: 0,
                                      width: '100%',
                                      bgcolor: formData.vehicleName === model.name ? alpha('#1976d2', 0.05) : 'background.paper',
                                      '&:hover': {
                                        bgcolor: alpha('#1976d2', 0.08),
                                      },
                                    }}
                                  />
                                </Grid>
                              ))}
                            </Grid>
                          </RadioGroup>
                        </FormControl>
                      </Paper>
                    </Collapse>

                    {/* Location & Time Inputs */}
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Pickup Location"
                        value={formData.pickupLocation}
                        onChange={(e) => handleChange('pickupLocation', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapPin size={18} color="#1976d2" />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />

                      <TextField
                        fullWidth
                        label="Drop-off Location"
                        placeholder="Enter drop-off address"
                        value={formData.dropoffLocation}
                        onChange={(e) => handleChange('dropoffLocation', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapPin size={18} color="#1976d2" />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />

                      <TextField
                        fullWidth
                        label="Pick-up Date & Time"
                        type="datetime-local"
                        value={formData.dateTime}
                        onChange={(e) => handleChange('dateTime', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Calendar size={18} color="#1976d2" />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="outlined"
                      />

                      <TextField
                        fullWidth
                        label="Number of Days"
                        type="number"
                        value={numberOfDays}
                        onChange={(e) => setNumberOfDays(Math.max(1, parseInt(e.target.value) || 1))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Clock size={18} color="#1976d2" />
                            </InputAdornment>
                          ),
                          inputProps: { min: 1 }
                        }}
                        variant="outlined"
                      />
                    </Stack>

                    {/* Next Button */}
                    <Box display="flex" justifyContent="flex-end" mt={4}>
                      <GradientButton
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowRight size={20} />}
                      >
                        Plan Your Trip
                      </GradientButton>
                    </Box>
                  </Box>
                )}

                {/* STEP 2: Personal Info - now handled in dialog */}
                {activeStep === 1 && (
                  <Box>
                    {/* intentionally left empty - moved to dialog */}
                  </Box>
                )}
              </form>
            </StyledPaper>
          </Grid>

          {/* Vehicle Details & Pricing Card */}
          <Grid item xs={12} md={4}>
            <InfoCard elevation={2}>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                Booking Summary
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              {/* Selected Vehicle */}
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary" fontWeight="600">
                  SELECTED VEHICLE
                </Typography>
                <Typography variant="h6" fontWeight="bold" mt={0.5}>
                  {selectedVehicle.name}
                </Typography>
                {formData.vehicleName && (
                  <Typography variant="body2" color="primary.main" fontWeight="600" mt={0.5}>
                    {formData.vehicleName}
                  </Typography>
                )}
              </Box>

              {/* Vehicle Specs */}
              <Stack spacing={2} mb={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      bgcolor: alpha('#1976d2', 0.1),
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                    }}
                  >
                    <Users size={20} color="#1976d2" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Max Passengers
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedVehicle.maxPassengers} People
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      bgcolor: alpha('#1976d2', 0.1),
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                    }}
                  >
                    <Briefcase size={20} color="#1976d2" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Max Luggage
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedVehicle.maxBags} Bags
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      bgcolor: alpha('#1976d2', 0.1),
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                    }}
                  >
                    <Clock size={20} color="#1976d2" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {numberOfDays} {numberOfDays === 1 ? 'Day' : 'Days'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Pricing */}
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Price per day
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    LKR {selectedVehicle.pricePerDay.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Number of days
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    × {numberOfDays}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  sx={{
                    bgcolor: alpha('#1976d2', 0.1),
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <DollarSign size={20} color="#1976d2" />
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      Total
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    LKR {totalPrice.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box mt={3}>
                <Chip 
                  label="Free Cancellation" 
                  color="success" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label="Instant Confirmation" 
                  color="info" 
                  size="small" 
                />
              </Box>

              {/* Find Packages Button */}
              <Box mt={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'scale(1.02)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => alert('Browse our exciting travel packages!')}
                >
                  Find Packages
                </Button>
              </Box>
            </InfoCard>
          </Grid>
        </Grid>

        {/* Footer Note */}
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mt={3}
        >
          Your booking information is secure and encrypted
        </Typography>

        {/* Personal Information Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 4,
                    height: 28,
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    mr: 1.5,
                  }}
                />
                <Typography variant="h5" fontWeight="bold">
                  Your Information
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDialog} size="small">
                <X size={20} />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" ml={3} mt={1}>
              Please provide your contact details to complete your booking
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color="#1976d2" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Telephone"
                placeholder="+94 XX XXX XXXX"
                value={formData.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={18} color="#1976d2" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} color="#1976d2" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCloseDialog}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
              }}
            >
              Cancel
            </Button>
            <SuccessButton
              onClick={handleSubmit}
              variant="contained"
            >
              Complete Booking
            </SuccessButton>
          </DialogActions>
        </Dialog>
      </Container>
    </GradientBox>
  );
}