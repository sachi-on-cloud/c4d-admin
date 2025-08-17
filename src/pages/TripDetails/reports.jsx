import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import React, { useState, useEffect } from 'react';
import moment from 'moment';

const tabs = ['Daily', 'Weekly', 'Monthly'];

const Reports = ({ accountId }) => {
  const [activeTab, setActiveTab] = useState('Weekly');
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]); // Adjusted to ISO format
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]); // Adjusted to ISO format
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
        // console.log('Vehicle Data:', vehicleData); 
        const vehiclesList = vehicleData.data || [];
        // console.log('Vehicles List:', vehiclesList); 
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
        // console.log('Driver Data:', driverData); 
        const driversList = driverData.data || [];
        // console.log('Drivers List:', driversList); 
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

  // Fetch trips
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

        // Transform API data to match component expectations
        const transformedTrips = data.data.map(trip => {
          const km = parseFloat(trip.totalKm) || 0;
          const endKm = parseFloat(trip.endKm) || 0;
          const startKm = parseFloat(trip.startKm) || 0;
          const calculatedKm = km + (endKm - startKm);
          return {
          date: trip.tripDate,
          vehicle: trip.Cab?.name || 'Unknown',
          driver: trip.Driver?.firstName || 'Unknown',
          route: `pickup Address: \n${trip.startAddress.address}\nDrop Address: \n${trip.endAddress.address}`,
          totalKm: isNaN(calculatedKm) ? 0 : calculatedKm,
          fuel: parseFloat(trip.fuelQuantity),
          cost: parseFloat(trip.fuelCost),
          fare: parseFloat(trip.tripFare),
          profit: parseFloat(trip.profit),
          };
        });

        
        const uniqueVehicles = Array.from(new Map(data.data.map(trip => [trip.Cab.id, trip.Cab])).values());
        const uniqueDrivers = Array.from(new Map(data.data.map(trip => [trip.Driver.id, trip.Driver])).values());
        if (vehicles.length === 0 && uniqueVehicles.length > 0) {
          // console.log('Using vehicles from trips:', uniqueVehicles);
          setVehicles(uniqueVehicles);
        }
        if (drivers.length === 0 && uniqueDrivers.length > 0) {
          // console.log('Using drivers from trips:', uniqueDrivers);
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

  // Handle CSV/XLSX export
  const handleExportCSV = () => {
    const data = trips.map(trip => [
      trip.date ? moment(trip.date).format('MM/DD/YYYY') : '-',
      trip.vehicle || '-',
      trip.driver || '-',
      trip.route || '-',
      isNaN(trip.totalKm) ? '0.000' : trip.totalKm.toFixed(2),
      isNaN(trip.fuel) ? '0.0' : trip.fuel.toFixed(1),
      isNaN(trip.cost) ? '0.00' : trip.cost.toFixed(2),
      isNaN(trip.fare) ? '0.00' : trip.fare.toFixed(2),
      isNaN(trip.profit) ? '0.00' : trip.profit.toFixed(2),
    ]);

    try {
      if (isXlsxLoaded && window.XLSX && typeof window.XLSX.utils.aoa_to_sheet === 'function') {
        const worksheetData = [
          ['Root Cabs Report - ' + fromDate + ' to ' + toDate],
          ['Date', 'Vehicle', 'Driver', 'Route', 'KM', 'Fuel', 'Cost', 'Fare', 'Profit'],
          ...data,
        ];
        const worksheet = window.XLSX.utils.aoa_to_sheet(worksheetData);

        if (worksheet['A1']) {
          worksheet['A1'].s = {
            fill: { fgColor: { rgb: '4B5EAA' } },
            font: { color: { rgb: 'FFFFFF' }, bold: true },
            alignment: { horizontal: 'center' },
          };
          worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
        }

        const headers = ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'];
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
        const headers = ['Date', 'Vehicle', 'Driver', 'Route', 'KM', 'Fuel', 'Cost', 'Fare', 'Profit'];
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

  // Calculate summary from trips
  const summary = {
    totalTrips: trips.length,
    totalKm: trips.reduce((sum, trip) => sum + (trip.totalKm || 0), 0),
    fuelUsed: trips.reduce((sum, trip) => sum + (trip.fuel || 0), 0),
    fuelCost: trips.reduce((sum, trip) => sum + (trip.cost || 0), 0),
    totalFare: trips.reduce((sum, trip) => sum + (trip.fare || 0), 0),
    profitLoss: trips.reduce((sum, trip) => sum + (trip.profit || 0), 0),
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
                      setFromDate(new Date().toISOString().split('T')[0]); // Today's date
                      setToDate(new Date().toISOString().split('T')[0]); // Today's date
                    } else if (tab === 'Weekly') {
                      setFromDate(new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]); // 7 days ago
                      setToDate(new Date().toISOString().split('T')[0]);
                    } else if (tab === 'Monthly') {
                      setFromDate(new Date(new Date().setDate(1)).toISOString().split('T')[0]); // First day of the month
                      setToDate(new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString().split('T')[0]); // Last day of the month
                    }
                    setCurrentPage(1); // Reset to first page when changing tabs
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
            <label className="block text-sm font-medium text-gray-700">Vehicle Name</label>
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
                    {/* (ID: {vehicle.id}) */}
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
                    {/*(ID: {driver.id}) */}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="p-2 border border-gray-200 text-center">Trips: {summary.totalTrips}</div>
          <div className="p-2 border border-gray-200 text-center">Total KM: {summary.totalKm.toFixed(1)}</div>
          <div className="p-2 border border-gray-200 text-center">Fuel Used: {summary.fuelUsed.toFixed(1)}</div>
          <div className="p-2 border border-gray-200 text-center">Fuel Cost: ₹ {summary.fuelCost.toFixed(2)}</div>
          <div className="p-2 border border-gray-200 text-center">Total Fare: ₹ {summary.totalFare.toFixed(2)}</div>
          <div className="p-2 border border-gray-200 text-center">Profit/Loss: ₹ {summary.profitLoss.toFixed(2)}</div>
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
                    <th className="border border-gray-200 p-2">Vehicle Name</th>
                    <th className="border border-gray-200 p-2">Driver</th>
                    <th className="border border-gray-200 p-2">Route</th>
                    <th className="border border-gray-200 p-2">KM</th>
                    <th className="border border-gray-200 p-2">Fuel</th>
                    <th className="border border-gray-200 p-2">Cost</th>
                    <th className="border border-gray-200 p-2">Fare</th>
                    <th className="border border-gray-200 p-2">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="border border-gray-200 p-2 text-center text-gray-500">
                        No trips found for the selected criteria
                      </td>
                    </tr>
                  ) : (
                    trips.map((trip, index) => (
                      <tr key={index}>
                        <td className="border border-gray-200 p-2">{trip.date ? moment(trip.date).format('MM/DD/YYYY') : '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.vehicle || '-'}</td>
                        <td className="border border-gray-200 p-2">{trip.driver || '-'}</td>
                        <td className="border border-gray-200 p-2">
                        {trip.route.split('\n').map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < trip.route.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </td>
                        <td className="border border-gray-200 p-2">{trip.totalKm.toFixed(1)}</td>
                        <td className="border border-gray-200 p-2">{trip.fuel.toFixed(1)}</td>
                        <td className="border border-gray-200 p-2">₹ {trip.cost.toFixed(2)}</td>
                        <td className="border border-gray-200 p-2">₹ {trip.fare.toFixed(2)}</td>
                        <td className="border border-gray-200 p-2">₹ {trip.profit.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-primary text-white rounded disabled:bg-gray-300"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-primary text-white rounded disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
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