import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { Button } from '@material-tailwind/react';

const TripDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trips, setTrips] = useState([]);
  const [summary, setSummary] = useState({
    totalKm: 0,
    fuelUsed: 0,
    fuelCost: 0,
    totalFare: 0,
    profit: 0,
  });
  const [error, setError] = useState('');

  const fetchTrips = async () => {
    try {
      const response = await ApiRequestUtils.get(API_ROUTES.GET_DRIVER_TRIP_DETAILS);
      const tripData = response?.data;

      if (!Array.isArray(tripData)) {
        setError('Unexpected data format from server.');
        setTrips([]);
        setSummary({
          totalKm: 0,
          fuelUsed: 0,
          fuelCost: 0,
          totalFare: 0,
          profit: 0,
        });
        return;
      }
      setTrips(tripData);

      const summaryData = tripData.reduce(
        (acc, trip) => ({
          totalKm: acc.totalKm + ((parseFloat(trip.endKm) || 0) - (parseFloat(trip.startKm) || 0)),
          fuelUsed: acc.fuelUsed + (parseFloat(trip.fuelQuantity) || 0),
          fuelCost: acc.fuelCost + (parseFloat(trip.fuelCost) || 0),
          totalFare: acc.totalFare + (parseFloat(trip.tripFare) || 0),
          profit: acc.profit + (parseFloat(trip.profit) || 0),
        }),
        { totalKm: 0, fuelUsed: 0, fuelCost: 0, totalFare: 0, profit: 0 }
      );

      setSummary(summaryData);
      setError('');
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to fetch trips. Please try again.');
      setTrips([]);
      setSummary({
        totalKm: 0,
        fuelUsed: 0,
        fuelCost: 0,
        totalFare: 0,
        profit: 0,
      });
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [location]);

  return (
    <div className="p-5 font-sans">
  <h2 className="text-2xl text-primary-400">Trip Master</h2>
      <div className="flex">
        <div className="mt-5 flex flex-wrap gap-5">
          <div className="bg-white p-4 rounded-lg shadow-md w-48">
            <div>Today’s KM</div>
            <div className="text-2xl font-bold">{summary.totalKm.toFixed(1)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md w-48">
            <div>Fuel Cost</div>
            <div className="text-2xl font-bold text-red-500">₹{summary.fuelCost.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md w-48">
            <div>Total Fare</div>
            <div className="text-2xl font-bold">₹{summary.totalFare.toFixed(2)}</div>
          </div>
        </div>
        <div className="mt-5 ml-auto">
          <button
            onClick={() => navigate('/dashboard/tripDetails/add')}
            className="bg-primary-400 hover:bg-primary-500 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            + Add New Trip
          </button>
        </div>
      </div>

      <div className="mt-5 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg">Recent Trips</h3>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Vehicle Number</th>
              <th className="p-2 text-left">Driver Name</th>
              <th className="p-2 text-left">Start Point</th>
              <th className="p-2 text-left">End Point</th>
              <th className="p-2 text-left">KM</th>
              <th className="p-2 text-left">Fare</th>
              {/* <th className="p-2 text-left">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 && !error ? (
              <tr>
                <td colSpan="8" className="p-2 text-center">No trips available</td>
              </tr>
            ) : (
              trips.map((trip, index) => (
                <tr key={index}>
                  <td className="p-2">{trip.tripDate || 'N/A'}</td>
                  <td onClick={() => navigate(`/dashboard/tripDetails/details/${trip.id}`)} className="p-2 text-blue-500 font-semibold underline cursor-pointer">{trip.Cab?.carNumber || 'N/A'}</td>
                  <td className="p-2">{trip.Driver?.firstName || 'N/A'}</td>
                  <td className="p-2">{trip.startAddress?.address || trip.startAddress || 'N/A'}</td>
                  <td className="p-2">{trip.endAddress?.address || trip.endAddress || 'N/A'}</td>
                  <td className="p-2">{((parseFloat(trip.endKm) || 0) - (parseFloat(trip.startKm) || 0)).toFixed(1) || 'N/A'}</td>
                  <td className="p-2">₹{parseFloat(trip.tripFare) || 'N/A'}</td>
                  {/* <td className="p-2">
                    <button className="text-primary-500 hover:underline">View</button>
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripDetails;