import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
  Input,
  Select,
  Option,
} from '@material-tailwind/react';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';

const AddTripDetails = () => {
  const [formData, setFormData] = useState({
    bookingId: '',
    bookingNumber: '',
    cabId: '',
    driverId: '',
    customerId: '',
    tripDate: moment().format('YYYY-MM-DD'),
    vehicleNumber: '',
    driverName: '',
    startAddress: '',
    endAddress: '',
    startKm: '',
    endKm: '',
    totalKm: '0.0',
    fuelType: 'CNG',
    fuelQuantity: '',
    fuelCost: '',
    tripFare: '',
    notes: '',
    startLat: 0,
    startLong: 0,
    endLat: 0,
    endLong: 0,
    toll: '',
    permit: '',
    tripType: 'Internal', // Added new field with default value
  });

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Fetch bookings when user types 4+ characters
  useEffect(() => {
    const fetchBookings = async () => {
      if (searchQuery.trim().length < 4) {
        setBookings([]);
        setFilteredBookings([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_BOOKING_ENDED_DETAILS, {
          searchKey: searchQuery,
        });
        if (data?.success) {
          const bookingsData = data?.data || [];
          setBookings(bookingsData);
          setFilteredBookings(bookingsData);
          if (bookingsData.length === 0) {
            setError('No bookings found');
          }
        } else {
          setError('Failed to fetch bookings');
        }
      } catch (err) {
        setError('Failed to fetch bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [searchQuery]);

  // Search box handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length >= 4) {
      setShowDropdown(true);
      setError('');
    } else {
      setFilteredBookings([]);
      setShowDropdown(false);
      setError('');
    }
  };

  // Booking selection from dropdown
  const handleBookingSelect = (booking) => {
    if (booking) {
      setFormData((prev) => ({
        ...prev,
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber || '',
        startAddress: booking.pickupAddress?.name || '',
        endAddress: booking.dropAddress?.name || '',
        driverName: booking.Driver?.firstName || '',
        vehicleNumber: booking.Cab?.carNumber || '',
        tripDate: moment(booking.startTime).format('YYYY-MM-DD'),
        startKm: booking.startKM?.toString() || '',
        endKm: booking.endKM?.toString() || '',
        totalKm: booking.totalDistanceKilometer || '0.0',
        cabId: booking.cabId,
        driverId: booking.driverId,
        customerId: booking.customer_id,
        tripType: 'Internal', // Reset tripType on booking selection
      }));
      setError('');
      setShowDropdown(false);
      setSearchQuery('');
    }
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'startKm' || name === 'endKm') {
        const start = parseFloat(newData.startKm) || 0;
        const end = parseFloat(newData.endKm) || 0;
        newData.totalKm = (end - start).toFixed(1);
      }
      return newData;
    });
  };

  // Select dropdown change
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      'bookingId',
      'bookingNumber',
      'tripDate',
      'vehicleNumber',
      'driverName',
      'startAddress',
      'endAddress',
      'startKm',
      'endKm',
      'totalKm',
      'fuelType',
      'tripFare',
      'tripType', // Added tripType to required fields
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    try {
      setLoading(true);
      const response = await ApiRequestUtils.post(API_ROUTES.ADD_TRIP_DETAILS, {
        bookingId: formData.bookingId,
        tripDate: formData.tripDate,
        latitude: formData.startLat,
        startLat: formData.startLat,
        startLong: formData.startLong,
        startAddress: { address: formData.startAddress },
        endLat: formData.endLat,
        endLong: formData.endLong,
        endAddress: { address: formData.endAddress },
        startKm: parseFloat(formData.startKm),
        endKm: parseFloat(formData.endKm),
        totalKm: parseFloat(formData.totalKm),
        fuelType: formData.fuelType,
        fuelCost: formData.fuelCost ? parseFloat(formData.fuelCost) : 0,
        tripFare: parseFloat(formData.tripFare),
        notes: formData.notes,
        customerId: formData.customerId,
        cabId: formData.cabId,
        driverId: formData.driverId,
        toll: formData.toll ? parseFloat(formData.toll) : 0,
        permit: formData.permit ? parseFloat(formData.permit) : 0,
        tripType: formData.tripType, // Added tripType to API payload
      });

      if (response?.success) {
        setFormData({
          bookingId: '',
          bookingNumber: '',
          cabId: '',
          driverId: '',
          customerId: '',
          tripDate: moment().format('YYYY-MM-DD'),
          vehicleNumber: '',
          driverName: '',
          startAddress: '',
          endAddress: '',
          startKm: '',
          endKm: '',
          totalKm: '0.0',
          fuelType: 'CNG',
          fuelQuantity: '',
          fuelCost: '',
          tripFare: '',
          notes: '',
          startLat: 0,
          startLong: 0,
          endLat: 0,
          endLong: 0,
          toll: '',
          permit: '',
          tripType: 'Internal', // Reset tripType
        });
        setBookings([]);
        setFilteredBookings([]);
        setSearchQuery('');
        setError('');
        setShowDropdown(false);
        navigate('/dashboard/tripDetails');
      } else {
        Swal.fire({
          icon: "error",
          title: "Trip Id Already Exists.",
          timer: 2000,
         
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Trip Id Already Exists.",
        timer: 2000,
        
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-5">
      {error && (
        <Typography color="red" className="mb-4">
          {error}
        </Typography>
      )}
      <Card className="mb-4">
        <CardBody>
          <Typography variant="h5" className="mb-2">
            Add Trip Details
          </Typography>
          <hr className="my-2" />
          <div className="mb-4 relative">
            <Typography color="gray" variant="h6" className="mb-1">
              Search Booking Number
            </Typography>
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Enter at least 4 characters to search Booking Number"
              className="w-full"
            />
            {showDropdown && filteredBookings.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleBookingSelect(booking)}
                  >
                    {booking.bookingNumber}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Booking Number *
              </Typography>
              <Input type="text" name="bookingNumber" value={formData.bookingNumber} readOnly disabled />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Trip Date *
              </Typography>
              <Input type="date" name="tripDate" value={formData.tripDate} readOnly disabled />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Vehicle Number *
              </Typography>
              <Input name="vehicleNumber" value={formData.vehicleNumber} readOnly disabled />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Driver Name *
              </Typography>
              <Input type="text" name="driverName" value={formData.driverName} readOnly disabled />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Trip Start Point *
              </Typography>
              <Input type="text" name="startAddress" value={formData.startAddress} readOnly disabled />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Trip End Point *
              </Typography>
              <Input type="text" name="endAddress" value={formData.endAddress} onChange={handleInputChange} />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Opening KM *
              </Typography>
              <Input type="number" name="startKm" value={formData.startKm} readOnly disabled />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Closing KM *
              </Typography>
              <Input type="number" name="endKm" value={formData.endKm} readOnly disabled />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Total KM (Auto)
              </Typography>
              <Input type="number" value={formData.totalKm} readOnly disabled />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Fuel Type *
              </Typography>
              <Select
                name="fuelType"
                value={formData.fuelType}
                onChange={(value) => handleSelectChange('fuelType', value)}
              >
                <Option value="CNG">CNG</Option>
                <Option value="PETROL">Petrol</Option>
                <Option value="DIESEL">Diesel</Option>
                <Option value="GAS">Gas</Option>
                <Option value="ELECTRIC">Electric</Option>
                <Option value="NONE">None</Option>
              </Select>
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Fuel Cost (₹)
              </Typography>
              <Input type="number" name="fuelCost" value={formData.fuelCost} onChange={handleInputChange} />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Toll (₹)
              </Typography>
              <Input
                type="number"
                name="toll"
                value={formData.toll}
                onChange={handleInputChange}
                placeholder="Enter Toll Cost"
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Permit (₹)
              </Typography>
              <Input
                type="number"
                name="permit"
                value={formData.permit}
                onChange={handleInputChange}
                placeholder="Enter Permit Cost"
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Trip Type *
              </Typography>
              <Select
                name="tripType"
                value={formData.tripType}
                onChange={(value) => handleSelectChange('tripType', value)}
              >
                <Option value="Internal">Internal</Option>
                <Option value="External">External</Option>
              </Select>
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Trip Fare (₹) *
              </Typography>
              <Input type="number" name="tripFare" value={formData.tripFare} onChange={handleInputChange} />
            </div>
            <div className="col-span-2">
              <Typography color="gray" variant="h6" className="mb-1">
                Notes
              </Typography>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special remarks..."
                className="p-2 w-full border rounded-md h-20"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-4 mt-4">
              <Button color="gray" variant="outlined" onClick={() => navigate('/dashboard/tripDetails')}>
                Cancel
              </Button>
              <Button color="blue" onClick={handleSubmit} disabled={loading}>
                Save Trip
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddTripDetails;