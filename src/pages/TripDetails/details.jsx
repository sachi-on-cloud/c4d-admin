import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
  Spinner,
} from '@material-tailwind/react';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';

const DetailsTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.state?.fromPath || '/dashboard/tripDetails';
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      try {
        const response = await ApiRequestUtils.get(`${API_ROUTES.GET_TRIP_BY_ID}${id}`);
        if (response?.success && response?.data) {
          setTrip(response.data);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container mx-auto mt-5">
        <Typography color="red" className="mb-4">
          {error || 'No trip data available'}
        </Typography>
        <Button
          color="gray"
          variant="outlined"
          onClick={() => navigate(backPath)}
        >
          Back to Trip List
        </Button>
      </div>
    );
  }

  return (
    <div className=" mt-5 p-8  min-h-screen">
      <Card className=" mx-auto bg-white shadow-md border border-gray-200">
        <CardBody className="p-6">
          <Typography variant="h4" className="mb-6 text-gray-800 font-semibold">
            Trip Details
          </Typography>
          <hr className="mb-6 border-gray-300" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Trip Date
                </Typography>
                <Input
                  value={trip.tripDate || '-'}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Vehicle Number
                </Typography>
                <Input
                  value={trip.Cab?.carNumber || '-'}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Driver Name
                </Typography>
                <Input
                  value={trip.Driver?.firstName || '-'}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Booking ID
                </Typography>
                <Input
                  value={trip.Booking?.bookingNumber|| '-'}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Trip Type
                </Typography>
                <Input
                  value={trip.tripType || '-'}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Trip Start Point
                </Typography>
                <Input
                  value={trip.startAddress?.address || trip.startAddress || '-'}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Trip End Point
                </Typography>
                <Input
                  value={trip.endAddress?.address || trip.endAddress || '-'}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Opening KM
                </Typography>
                <Input
                  value={parseFloat(trip.startKm) || '-'}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Closing KM
                </Typography>
               <Input
                  value={
                    trip.endKm !== null && trip.endKm !== undefined && trip.endKm !== ''
                      ? parseFloat(trip.endKm)
                      : '0'
                  }
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Total KM
                </Typography>
                <Input
                  value={((parseFloat(trip.endKm) || 0) - (parseFloat(trip.startKm) || 0)).toFixed(1) || '-'}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Fuel Type
                </Typography>
                <Input
                  value={trip.fuelType || '-'}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Fuel Cost
                </Typography>
                <Input
                  value={`${parseFloat(trip.fuelCost)?.toFixed(2) || ''}`}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Trip Fare
                </Typography>
                <Input
                  value={`${parseFloat(trip.tripFare)?.toFixed(2) || ''}`}
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Toll Cost
                </Typography>
               <Input
                  value={
                    trip.toll
                      ? `${parseFloat(trip.toll).toFixed(2)}`
                      : '0'
                  }
                  readOnly
                  className="w-full bg-gray-100 border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography color="gray" variant="h6" className="mb-1">
                  Permit Cost
                </Typography>
                <Input
                    value={
                      trip.permit
                        ? `${parseFloat(trip.permit).toFixed(2)}`
                        : '0'
                    }
                    readOnly
                    className="w-full bg-gray-100 border-gray-300 rounded-md"
                  />
            </div>
           
            </div>
             <div>
              <Typography color="gray" variant="h6" className="mb-1">
                Notes
              </Typography>
              <Textarea
                value={trip.notes || ''}
                readOnly
                className="w-full bg-gray-100 border-gray-300 rounded-md p-2"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button
                color="gray"
                variant="outlined"
                className="px-4 py-2"
                onClick={() => navigate(backPath)}
              >
                Back to Trip List
              </Button>
              <Button
                color="blue"
                className="px-4 py-2"
                onClick={() => navigate(`/dashboard/tripDetails/details/edit/${id}`)}
              >
                Edit
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DetailsTrip;