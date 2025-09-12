import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
  Input,
  Select,
  Option,
  Textarea,
} from '@material-tailwind/react';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';

const TripDetailsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tripId: '',
    tripDate: '',
    vehicleNumber: '',
    driverName: '',
    bookingId: '',
    tripType: '',
    startAddress: '',
    endAddress: '',
    startKm: '',
    endKm: '',
    totalKm: '0.0',
    fuelType: 'CNG',
    fuelCost: '',
    tripFare: '',
    toll: '',
    permit: '',
    notes: '',
    latitude: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      try {
        const response = await ApiRequestUtils.get(`${API_ROUTES.GET_TRIP_BY_ID}${id}`);
        console.log('Fetch trip response:', response);
        if (response?.success && response?.data) {
          const trip = response.data;
          setFormData({
            tripId: trip.id?.toString() || id,
            tripDate: trip.tripDate || '',
            vehicleNumber: trip.Cab?.carNumber || '',
            driverName: trip.Driver?.firstName || '',
            bookingId: trip.bookingId || '',
            bookingNumber: trip.Booking?.bookingNumber || '',
            tripType: trip.tripType || '',
            startAddress: trip.startAddress?.address || trip.startAddress || '',
            endAddress: trip.endAddress?.address || trip.endAddress || '',
            startKm: trip.startKm?.toString() || '',
            endKm: trip.endKm?.toString() || '',
            totalKm: ((parseFloat(trip.endKm) || 0) - (parseFloat(trip.startKm) || 0)).toFixed(1) || '0.0',
            fuelType: trip.fuelType || 'CNG',
            fuelCost: trip.fuelCost?.toString() || '',
            tripFare: trip.tripFare?.toString() || '',
            toll: trip.toll?.toString() || '',
            permit: trip.permit?.toString() || '',
            notes: trip.notes || '',
            latitude: trip.startLat?.toString() || '',
          });
          setError('');
        } else {
          setError('Failed to fetch trip details');
        }
      } catch (err) {
        console.error('Error fetching trip:', err);
        setError('Failed to fetch trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

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

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      'tripId',
      'tripDate',
      'vehicleNumber',
      'driverName',
      'bookingId',
      'tripType',
      'startAddress',
      'endAddress',
      'startKm',
      'endKm',
      'fuelType',
      'tripFare',
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field] === '0' || formData[field] === '0.0') {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    if (!formData.totalKm) {
      setError('Total KM cannot be empty');
      return;
    }

    const payload = {
      tripId: parseInt(formData.tripId),
      tripDate: formData.tripDate,
      vehicleNumber: formData.vehicleNumber,
      driverName: formData.driverName,
      bookingId: formData.bookingId,
      bookingNumber: formData.bookingNumber,
      tripType: formData.tripType,
      startAddress: { address: formData.startAddress },
      endAddress: { address: formData.endAddress },
      startKm: parseFloat(formData.startKm),
      endKm: parseFloat(formData.endKm),
      totalKm: parseFloat(formData.totalKm),
      fuelType: formData.fuelType,
      fuelCost: formData.fuelCost ? parseFloat(formData.fuelCost) : 0,
      tripFare: parseFloat(formData.tripFare),
      toll: formData.toll ? parseFloat(formData.toll) : 0,
      permit: formData.permit ? parseFloat(formData.permit) : 0,
      notes: formData.notes || '',
      latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
    };

    try {
      setLoading(true);
      // console.log('Sending update request with payload:', payload);
      const response = await ApiRequestUtils.update(API_ROUTES.UPDATE_TRIP_DETAILS, payload);
      // console.log('Update trip response:', response);
      if (response?.success) {
        navigate('/dashboard/tripDetails');
      } else {
        setError('Failed to update trip: Invalid response from server');
      }
    } catch (err) {
      console.error('Error updating trip:', err);
      setError('Failed to update trip: Server error');
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
    <div className=" mt-5 p-8  min-h-screen">
      {error && (
        <Typography color="red" className="mb-4 text-center">
          {error}
        </Typography>
      )}
      <Card className=" mx-auto bg-white shadow-md border border-gray-300">
        <CardBody className="p-6">
          <Typography variant="h4" className="mb-6 text-gray-800 font-semibold">
            Edit Trip Details
          </Typography>
          <hr className="mb-6 border-gray-300" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Trip ID *
                </Typography>
                <Input
                  type="text"
                  name="tripId"
                  value={formData.tripId}
                  onChange={handleInputChange}
                  readOnly
                  disabled
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div> */}
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Trip Date
                </Typography>
                <Input
                  type="date"
                  name="tripDate"
                  value={formData.tripDate}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                />
                
              </div>
               <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Vehicle Number
                </Typography>
                <Input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                  disabled
                  readOnly
                />
              </div>
              
              
            </div>
            <div className="grid grid-cols-2 gap-4">
             
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Driver Name
                </Typography>
                <Input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                  disabled
                  readOnly
                />
              </div>
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Booking Number
                </Typography>
                <Input
                  type="text"
                  name="bookingId"
                  value={formData.bookingNumber}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                  disabled
                  readOnly
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Trip Type
                </Typography>
                <Select
                  name="tripType"
                  value={formData.tripType}
                  onChange={(value) => handleSelectChange('tripType', value)}
                  className="w-full bg-white border-gray-300 rounded-md"
                >
                  <Option value="Internal">Internal</Option>
                  <Option value="External">External</Option>
                </Select>
              </div>
              
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Trip Start Point
                </Typography>
                <Input
                  type="text"
                  name="startAddress"
                  value={formData.startAddress}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                  disabled
                  readOnly
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Trip End Point
                </Typography>
                <Input
                  type="text"
                  name="endAddress"
                  value={formData.endAddress}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                  disabled
                  readOnly
                />
              </div>
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Opening KM
                </Typography>
                <Input
                  type="number"
                  name="startKm"
                  value={formData.startKm}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Closing KM
                </Typography>
                <Input
                  type="number"
                  name="endKm"
                  value={formData.endKm}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Total KM
                </Typography>
                <Input
                  type="number"
                  name="totalKm"
                  value={formData.totalKm}
                  readOnly
                  disabled
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Fuel Type
                </Typography>
                <Select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={(value) => handleSelectChange('fuelType', value)}
                  className="w-full bg-white border-gray-300 rounded-md"
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
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Fuel Cost
                </Typography>
                <Input
                  type="number"
                  name="fuelCost"
                  value={formData.fuelCost}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Trip Fare
                </Typography>
                <Input
                  type="number"
                  name="tripFare"
                  value={formData.tripFare}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                  placeholder="Enter trip fare"
                />
              </div>
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Toll Cost
                </Typography>
                <Input
                  type="number"
                  name="toll"
                  value={formData.toll}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                  placeholder="Enter toll cost"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Permit Cost
                </Typography>
                <Input
                  type="number"
                  name="permit"
                  value={formData.permit}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md"
                  placeholder="Enter permit cost"
                />
              </div>
              
            </div>
            <div>
                <Typography color="gray" className="text-sm font-medium mb-2">
                  Notes
                </Typography>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full bg-white border-gray-300 rounded-md p-2"
                  rows={3}
                />
              </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button
                color="gray"
                variant="outlined"
                className="px-4 py-2"
                onClick={() => navigate('/dashboard/tripDetails')}
              >
                Cancel
              </Button>
              <Button
                color="blue"
                className="px-4 py-2"
                onClick={handleSubmit}
                disabled={loading}
              >
                Update Trip
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TripDetailsEdit;