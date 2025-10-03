import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Button } from '@material-tailwind/react';
import { ColorStyles } from '@/utils/constants'; // Assuming ColorStyles is available, as in TripDetails

const tabs = ['Daily', 'Weekly', 'Monthly'];

const Reports = ({ accountId }) => {
  const [activeTab, setActiveTab] = useState('Weekly');
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');
  const [driverFilter, setDriverFilter] = useState('All Drivers');
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [error, setError] = useState(null);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [driversError, setDriversError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isXlsxLoaded, setIsXlsxLoaded] = useState(false);

  
  const [summary, setSummary] = useState({
    totalTrips: 0,
    totalKm: 0,
    fuelUsed: 0,
    fuelCost: 0,
    totalFare: 0,
    profitLoss: 0,
  });

  useEffect(() => {
    const checkXlsx = (attempts = 5, delay = 500) => {
      if (window.XLSX && typeof window.XLSX.utils.aoa_to_sheet === 'function') {
        setIsXlsxLoaded(true);
        return;
      }
      setTimeout(() => checkXlsx(attempts - 1, delay), delay);
    };
    checkXlsx();
  }, []);

  useEffect(() => {
    const fetchVehiclesAndDrivers = async () => {
      setLoadingVehicles(true);
      setLoadingDrivers(true);
      setVehiclesError(null);
      setDriversError(null);

      try {
        const vehicleData = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ACCOUNT_CABS, { accountId });
        const vehiclesList = vehicleData.data || [];
        if (vehiclesList.length === 0) {
          console.warn('No vehicles from GET_ACCOUNT_CABS, falling back to trips data');
        }
        setVehicles(vehiclesList);
      } catch (err) {
        setVehiclesError('Failed to fetch vehicles: ' + err.message);
        console.error('Vehicles fetch error:', err);
      } finally {
        setLoadingVehicles(false);
      }

      try {
        const driverData = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ACCOUNT_RELATED_DRIVERS + accountId);
        const driversList = driverData.data || [];
        if (driversList.length === 0) {
          console.warn('No drivers from GET_ACCOUNT_RELATED_DRIVERS, falling back to trips data');
        }
        setDrivers(driversList);
      } catch (err) {
        setDriversError('Failed to fetch drivers: ' + err.message);
        console.error('Drivers fetch error:', err);
      } finally {
        setLoadingDrivers(false);
      }
    };

    if (accountId) {
      fetchVehiclesAndDrivers();
    }
  }, [accountId]);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: 10,
          fromDate,
          toDate,
          cabId: vehicleFilter === 'All Vehicles' ? '' : vehicleFilter,
          driverId: driverFilter === 'All Drivers' ? '' : driverFilter,
        };
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_TRIP_REPORTS, params);

        
        if (data.summary) {
          setSummary(data.summary);
        }

        
        const transformedTrips = data.data.map(trip => {
          console.log("Mapping trip:", trip);
          const km = parseFloat(trip.totalKm) || 0;
          const endKm = parseFloat(trip.endKm) || 0;
          const startKm = parseFloat(trip.startKm) || 0;
          const calculatedKm = km + (endKm - startKm);
          return {
            date: trip.tripDate,
            bookingId:trip.bookingId,
            tripType:trip.tripType,
            vehicle: trip.Cab?.carNumber || 'Unknown',
            driver: trip.Driver?.firstName || 'Unknown',
            startPoint: trip.startAddress?.address || trip.startAddress || 'Unknown',
            endPoint: trip.endAddress?.address || trip.endAddress || 'Unknown',
            totalKm: isNaN(calculatedKm) ? 0 : calculatedKm,
            toll: parseFloat(trip.toll) || 0,
            permit: parseFloat(trip.permit) || 0,
            cost: parseFloat(trip.fuelCost) || 0,
            fare: parseFloat(trip.tripFare) || 0,
          };
        });

        const uniqueVehicles = Array.from(new Map(data.data.map(trip => [trip.Cab.id, trip.Cab])).values());
        const uniqueDrivers = Array.from(new Map(data.data.map(trip => [trip.Driver.id, trip.Driver])).values());
        if (vehicles.length === 0 && uniqueVehicles.length > 0) {
          setVehicles(uniqueVehicles);
        }
        if (drivers.length === 0 && uniqueDrivers.length > 0) {
          setDrivers(uniqueDrivers);
        }

        setTrips(transformedTrips);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        setError('Failed to fetch trips: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [fromDate, toDate, vehicleFilter, driverFilter, activeTab, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const generatePageButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          variant={i === currentPage ? 'filled' : 'outlined'}
          className={`mx-1 ${ColorStyles.bgColor} ${i === currentPage ? 'text-white' : 'text-white'}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };

  const handleExportCSV = () => {
    const data = trips.map(trip => [
      trip.date ? moment(trip.date).format('MM/DD/YYYY') : '-',
      trip.bookingId || '-',
      trip.tripType || '-',
      trip.vehicle || '-',
      trip.driver || '-',
      trip.startPoint || '-',
      trip.endPoint || '-',
      isNaN(trip.totalKm) ? '0.000' : trip.totalKm.toFixed(2),
      isNaN(trip.toll) ? '0.00' : trip.toll.toFixed(2),
      isNaN(trip.permit) ? '0.00' : trip.permit.toFixed(2),
      isNaN(trip.cost) ? '0.00' : trip.cost.toFixed(2),
      isNaN(trip.fare) ? '0.00' : trip.fare.toFixed(2),
    ]);

    try {
      if (isXlsxLoaded && window.XLSX && typeof window.XLSX.utils.aoa_to_sheet === 'function') {
        const worksheetData = [
          ['Root Cabs Report - ' + fromDate + ' to ' + toDate],
          ['Date', 'Vehicle', 'Driver', 'Start Point', 'End Point', 'KM', 'Toll', 'Permit', 'Cost', 'Fare'],
          ...data,
        ];
        const worksheet = window.XLSX.utils.aoa_to_sheet(worksheetData);

        if (worksheet['A1']) {
          worksheet['A1'].s = {
            fill: { fgColor: { rgb: '4B5EAA' } },
            font: { color: { rgb: 'FFFFFF' }, bold: true },
            alignment: { horizontal: 'center' },
          };
          worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];
        }

        const headers = ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2', 'J2'];
        headers.forEach(cell => {
          if (worksheet[cell]) {
            worksheet[cell].s = {
              fill: { fgColor: { rgb: 'D3D3D3' } },
              font: { color: { rgb: '000000' } },
              alignment: { horizontal: 'center' },
            };
          }
        });

        const range = window.XLSX.utils.decode_range(worksheet['!ref']);
        for (let row = range.s.r + 2; row <= range.e.r; row++) {
          const cellAddress = `A${row + 1}`;
          if (worksheet[cellAddress] && worksheet[cellAddress].v !== '-' && moment(worksheet[cellAddress].v, 'MM/DD/YYYY', true).isValid()) {
            worksheet[cellAddress].t = 'd';
            worksheet[cellAddress].z = 'mm/dd/yyyy';
            const dateValue = moment(worksheet[cellAddress].v, 'MM/DD/YYYY').toDate();
            if (!isNaN(dateValue)) {
              worksheet[cellAddress].v = dateValue;
            }
          }
        }

        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        const filename = `Report_${fromDate}_to_${toDate}.xlsx`;
        window.XLSX.write_file(workbook, filename, { bookType: 'xlsx', type: 'binary' });
      } else {
        const headers = ['Date', 'Vehicle', 'Driver', 'Start Point', 'End Point', 'KM', 'Toll', 'Permit', 'Cost', 'Fare'];
        const escapeCsvValue = (value) => `"${String(value).replace(/"/g, '""')}"`;
        const rows = data.map(row => headers.map((header, index) => escapeCsvValue(row[index])).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const filename = `Report_${fromDate}_to_${toDate}.csv`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow">
        <div className="border-b border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'Daily') {
                      setFromDate(new Date().toISOString().split('T')[0]);
                      setToDate(new Date().toISOString().split('T')[0]);
                    } else if (tab === 'Weekly') {
                      setFromDate(new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]);
                      setToDate(new Date().toISOString().split('T')[0]);
                    } else if (tab === 'Monthly') {
                      setFromDate(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
                      setToDate(new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString().split('T')[0]);
                    }
                    setCurrentPage(1);
                  }}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
            {loadingVehicles ? (
              <div className="text-gray-500">Loading vehicles...</div>
            ) : vehiclesError ? (
              <div className="text-red-500">{vehiclesError}</div>
            ) : (
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="All Vehicles">All Vehicles</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Driver</label>
            {loadingDrivers ? (
              <div className="text-gray-500">Loading drivers...</div>
            ) : driversError ? (
              <div className="text-red-500">{driversError}</div>
            ) : (
              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="All Drivers">All Drivers</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.firstName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="p-2 border border-gray-200 text-center">Trips: {summary.totalTrips}</div>
          <div className="p-2 border border-gray-200 text-center">Total KM: {summary.totalKm}</div>
          {/* <div className="p-2 border border-gray-200 text-center">Fuel Used: {summary.fuelUsed}</div> */}
          <div className="p-2 border border-gray-200 text-center">Fuel Cost: ₹ {summary.fuelCost}</div>
          <div className="p-2 border border-gray-200 text-center">Total Fare: ₹ {summary.totalFare}</div>
          {/* <div className="p-2 border border-gray-200 text-center">Profit/Loss: ₹ {summary.profitLoss}</div> */}
        </div>
        <div className="weekly-report">
          <h3 className="text-lg font-semibold mb-4 text-center bg-primary-900 text-white p-2 rounded" style={{ width: '100%' }}>
            Root Cabs Report - {fromDate} to {toDate}</h3>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary-900 text-white text-center">
                    <th className="border border-gray-200 p-2">Date</th>
                    <th className="border border-gray-200 p-2">BookingId</th>
                    <th className="border border-gray-200 p-2">Trip Type</th>
                    <th className="border border-gray-200 p-2">Vehicle Number</th>
                    <th className="border border-gray-200 p-2">Driver</th>
                    <th className="border border-gray-200 p-2">Start Point</th>
                    <th className="border border-gray-200 p-2">End Point</th>
                    <th className="border border-gray-200 p-2">KM</th>
                    <th className="border border-gray-200 p-2">Toll</th>
                    <th className="border border-gray-200 p-2">Permit</th>
                    <th className="border border-gray-200 p-2">Cost</th>
                    <th className="border border-gray-200 p-2">Fare</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="border border-gray-200 p-2 text-center text-gray-500">
                        No trips found for the selected criteria
                      </td>
                    </tr>
                  ) : (
                    trips.map((trip, index) => (
                      <tr key={index}>
                        <td className="border border-gray-200 p-2">{trip.date ? moment(trip.date).format('MM/DD/YYYY') : '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.bookingId || '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.tripType || '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.vehicle || '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.driver || '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.startPoint || '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.endPoint || '-'}</td>
                        <td className="border border-gray-200 p-2">{isNaN(trip.totalKm) ? '0.0' : trip.totalKm.toFixed(1)}</td>
                        <td className="border border-gray-200 p-2"> {isNaN(trip.toll) ? '0.00' : trip.toll.toFixed(2)}</td>
                        <td className="border border-gray-200 p-2">{isNaN(trip.permit) ? '0.00' : trip.permit.toFixed(2)}</td>
                        <td className="border border-gray-200 p-2">{isNaN(trip.cost) ? '0.00' : trip.cost.toFixed(2)}</td>
                        <td className="border border-gray-200 p-2">{isNaN(trip.fare) ? '0.00' : trip.fare.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {trips.length > 0 && (
                <div className="flex items-center justify-center mt-4">
                  <Button
                    size="sm"
                    variant="text"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="mx-1 text-gray-700"
                  >
                    {'<'}
                  </Button>
                  {generatePageButtons()}
                  <Button
                    size="sm"
                    variant="text"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="mx-1 text-gray-700"
                  >
                    {'>'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <button
          onClick={handleExportCSV}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Export to CSV
        </button>
      </div>
    </div>
  );
};

export default Reports;