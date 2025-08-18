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

const AddTripDetails = () => {
  const [formData, setFormData] = useState({
    bookingId: '',
    cabId:'',
    driverId:'',
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
    profit: '0.00',
    notes: '',
    startLat: 0,
    startLong: 0,
    endLat: 0,
    endLong: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch all bookings when the component mounts
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await ApiRequestUtils.get(API_ROUTES.GET_BOOKING_ENDED_DETAILS);
        if (data?.success) {
          const bookingsData = data?.data || [];
          setBookings(bookingsData);
          if (bookingsData.length === 0) {
            setError('No bookings found');
          }
        } else {
          setError('Failed to fetch bookings');
        }
      } catch (err) {
        setError('Failed to fetch bookings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []); // Empty dependency array to run once on mount

  // Handle booking selection and auto-fill form
  const handleBookingSelect = (bookingId) => {
    const selectedBooking = bookings.find(
      (booking) => booking.id.toString() === bookingId
    );
    if (selectedBooking) {
      setFormData((prev) => ({
        ...prev,
        bookingId: selectedBooking.id.toString(),
        startAddress: selectedBooking.pickupAddress?.name || '',
        endAddress: selectedBooking.dropAddress?.name || '',
        driverName: selectedBooking.Driver?.firstName || '',
        vehicleNumber: selectedBooking.Cab?.carNumber ||'',
        tripDate: moment(selectedBooking.startTime).format('YYYY-MM-DD') || prev.tripDate,
        startKm: selectedBooking.startKM?.toString() || '', // Corrected to use startKM
        endKm: selectedBooking.endKM?.toString() || '', // Corrected to use endKM
        totalKm: selectedBooking.totalDistanceKilometer || '0.0',
      }));
      setError('');
    } else {
      setError('Selected booking not found');
      setFormData((prev) => ({
        ...prev,
        bookingId: '',
        startAddress: '',
        endAddress: '',
        driverName: '',
        vehicleNumber: '',
        tripDate: moment().format('YYYY-MM-DD'),
        startKm: '',
        endKm: '',
        totalKm: '0.0',
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Calculate total KM only if startKm or endKm changes
      if (name === 'startKm' || name === 'endKm') {
        const start = parseFloat(newData.startKm) || 0;
        const end = parseFloat(newData.endKm) || 0;
        newData.totalKm = (end - start).toFixed(1);
      }

      // Calculate profit/loss
      if (name === 'tripFare' || name === 'fuelCost') {
        const fare = parseFloat(newData.tripFare) || 0;
        const cost = parseFloat(newData.fuelCost) || 0;
        newData.profit = (fare - cost).toFixed(2);
      }

      return newData;
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'bookingId') {
      handleBookingSelect(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      'bookingId',
      'tripDate',
      'vehicleNumber',
      'driverName',
      'startAddress',
      'endAddress',
      'startKm',
      'endKm',
      'totalKm',
      'fuelType',
      'fuelQuantity',
      'fuelCost',
      'tripFare',
    ];

    // Validate required fields
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    // Validate bookingId
    const selectedBooking = bookings.find(
      (booking) => booking.id.toString() === formData.bookingId
    );
    if (!selectedBooking) {
      setError('Invalid Booking ID');
      return;
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
        fuelQuantity: parseFloat(formData.fuelQuantity),
        fuelCost: parseFloat(formData.fuelCost),
        tripFare: parseFloat(formData.tripFare),
        profit: parseFloat(formData.profit),
        notes: formData.notes,
        customerId: selectedBooking.customer_id, // Include customerId from selected booking
        cabId: selectedBooking.cabId,
        driverId: selectedBooking.driverId,
      });
      if (response?.success) {
        setFormData({
          bookingId: '',
          cabId:'',
          driverId:'',
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
          profit: '0.00',
          notes: '',
          startLat: 0,
          startLong: 0,
          endLat: 0,
          endLong: 0,
        });
        // console.log('Trip added successfully:' ,response);
        setBookings([]);
        setError('');
        navigate('/dashboard/tripDetails');
      } else {
        setError('Failed to add trip. Please try again.');
      }
    } catch (err) {
      setError('Failed to add trip. Please try again.');
      console.error(err);
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Booking ID *
              </Typography>
              <Select
                name="bookingId"
                value={formData.bookingId}
                onChange={(value) => handleSelectChange('bookingId', value)}
              >
                <Option value="">Select Booking ID</Option>
                {bookings.map((booking) => (
                  <Option key={booking.id} value={booking.id.toString()}>
                    {booking.id}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Trip Date *
              </Typography>
              <Input
                type="date"
                name="tripDate"
                value={formData.tripDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Vehicle Number *
              </Typography>
              <Input
                name="vehicleNumber"
                value={formData.vehicleNumber}
               
              >
               
              </Input>
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Driver Name *
              </Typography>
              <Input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleInputChange}
                placeholder="Enter Driver Name"
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Trip Start Point *
              </Typography>
              <Input
                type="text"
                name="startAddress"
                value={formData.startAddress}
                onChange={handleInputChange}
                placeholder="Trip Start Point"
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Trip End Point *
              </Typography>
              <Input
                type="text"
                name="endAddress"
                value={formData.endAddress}
                onChange={handleInputChange}
                placeholder="Trip End Point"
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Opening KM *
              </Typography>
              <Input
                type="number"
                name="startKm"
                value={formData.startKm}
                onChange={handleInputChange}
                placeholder="Opening KM"
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Closing KM *
              </Typography>
              <Input
                type="number"
                name="endKm"
                value={formData.endKm}
                onChange={handleInputChange}
                placeholder="Closing KM"
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Total KM (Auto)
              </Typography>
              <Input
                type="number"
                value={formData.totalKm}
                readOnly
                disabled
              />
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
                <Option value="Petrol">Petrol</Option>
                <Option value="Diesel">Diesel</Option>
              </Select>
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Fuel Quantity *
              </Typography>
              <Input
                type="number"
                name="fuelQuantity"
                value={formData.fuelQuantity}
                onChange={handleInputChange}
                placeholder="Fuel Quantity"
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Fuel Cost (₹) *
              </Typography>
              <Input
                type="number"
                name="fuelCost"
                value={formData.fuelCost}
                onChange={handleInputChange}
                placeholder="Fuel Cost"
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Trip Fare (₹) *
              </Typography>
              <Input
                type="number"
                name="tripFare"
                value={formData.tripFare}
                onChange={handleInputChange}
                placeholder="Trip Fare"
              />
            </div>
            <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Profit/Loss (Auto)
              </Typography>
              <Input
                type="number"
                value={formData.profit}
                readOnly
                disabled
              />
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
              <Button
                color="gray"
                variant="outlined"
                onClick={() => navigate('/dashboard/tripDetails')}
              >
                Cancel
              </Button>
              <Button
                color="blue"
                onClick={handleSubmit}
                disabled={loading}
              >
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