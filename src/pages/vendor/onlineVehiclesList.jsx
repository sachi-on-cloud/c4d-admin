import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Spinner,
  Button,
  Select,
  Option,
  Popover,
  PopoverHandler,
  PopoverContent,
  Checkbox,
} from '@material-tailwind/react';
import { FaFilter } from 'react-icons/fa';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

export function OnlineVehiclesList({ id = 0 }) {
  const [vehicleList, setVehicleList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusCheckedDriverIds, setStatusCheckedDriverIds] = useState([]);
  const [selectedInterval, setSelectedInterval] = useState('');
   const [typeFilter, setTypeFilter] = useState(['All']);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const checkPresence = async (driverId, vehicleId) => {
    try {
      const result = await ApiRequestUtils.post(API_ROUTES.CHECK_PRESENCE, { driverId });
      if (result?.success && result?.data?.status) {
        setVehicleList((prev) =>
          prev.map((vehicle) =>
            vehicle.id === vehicleId && vehicle.Drivers?.length > 0
              ? {
                  ...vehicle,
                  Drivers: [
                    {
                      ...vehicle.Drivers[0],
                      status: result.data.status === 'AVAILABLE' ? 'ACTIVE' : 'INACTIVE',
                    },
                  ],
                }
              : vehicle
          )
        );
      } else {
        console.error('Invalid API response:', result?.message);
      }
    } catch (error) {
      console.error('Error checking presence:', error);
    } finally {
      setStatusCheckedDriverIds((prev) => [...new Set([...prev, driverId])]);
    }
  };

  const checkAllStatus = async () => {
    const vehiclesWithDrivers = vehicleList.filter(
      (vehicle) =>
        vehicle.Drivers?.length > 0 &&
        !statusCheckedDriverIds.includes(vehicle.Drivers[0]?.id)
    );
    for (const vehicle of vehiclesWithDrivers) {
      await checkPresence(vehicle.Drivers[0]?.id, vehicle.id);
    }
  };

  const fetchCabList = async () => {
    setLoading(true);
    try {
      const driverType = typeFilter[0] === 'All' ? 'ALL' : typeFilter[0];
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_CABS_PACKAGE, {
        isToday:'true',
        type: driverType,
      });
      if (data?.success) {
        const updatedVehicleList = (data.data || []).map((item) => {
          // console.log(`Vehicle ${item.id}: Shift availability = ${item.Shifts?.[0]?.availability}`);
          return {
            ...item,
            Drivers: item.Drivers?.length > 0
              ? item.Drivers.map((driver) => ({
                  ...driver,
                  status: item.Shifts?.[0]?.availability === 'AVAILABLE' ? 'ACTIVE' : 'INACTIVE',
                }))
              : [],
          };
        });
        setVehicleList(updatedVehicleList);
        setStatusCheckedDriverIds([]);
        // console.log('Fetched vehicle list:', updatedVehicleList);
      } else {
        console.error('API request failed:', data?.message);
      }
    } catch (error) {
      console.error('Error fetching vehicle list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIntervalChange = (value) => {
    setSelectedInterval(value);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      intervalRef.current = null;
      }
    if (value) {
      const intervalSeconds = parseInt(value);
      intervalRef.current = setInterval(() => {
        fetchCabList();
      }, intervalSeconds * 1000);
    }
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'type') {
      setTypeFilter([value]);
    }
  };

  useEffect(() => {
    fetchCabList();
  }, [typeFilter]);

  useEffect(() => {
    fetchCabList();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  const filteredVehicles = vehicleList.filter((v) => {
    if (typeFilter[0] === 'All') return true;
    return (v.type?.toUpperCase() ?? '') === typeFilter[0];
  });

  const FilterPopover = ({ title, options, selectedFilters, onFilterChange }) => (
    <Popover placement="bottom-start">
      <PopoverHandler>
        <div className="flex items-center cursor-pointer">
          <Typography
            variant="small"
            className={`text-[11px] font-bold uppercase mr-1 ${ColorStyles.PopoverHandlerText}`}
          >
            {title}
          </Typography>
          <FaFilter className="text-black text-xs" />
        </div>
      </PopoverHandler>
      <PopoverContent className="p-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center mb-2">
            <Checkbox
              color="blue"
              checked={selectedFilters[0] === option.value}
              onChange={() => onFilterChange('type', option.value)}
            />
            <Typography color="blue-gray" className="font-medium ml-2">
              {option.label}
            </Typography>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="p-4 border border-gray-300 rounded-lg shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4 max-w-[500px]">
          <Select
            label={selectedInterval ? `Refreshing every ${selectedInterval}` : 'Select Refresh Interval'}
            value={selectedInterval}
            onChange={handleIntervalChange}
          >
            <Option value="">Stop Refresh</Option>
            {['5', '10', '15', '20', '30', '60', '90', '120'].map((sec) => (
              <Option key={sec} value={sec}>{`${sec} sec`}</Option>
            ))}
          </Select>
        </div>
      </div>
      <Card>
            <CardHeader
              variant="gradient"
              className="mb-8 p-6 flex justify-between items-center bg-primary"
            >
              <Typography variant="h6" color="white">
                Online Vehicles List
              </Typography>
              <Button
                color="red"
                size="sm"
                onClick={checkAllStatus}
                disabled={vehicleList.every(
                  (vehicle) =>
                    vehicle.Drivers?.length === 0 ||
                    statusCheckedDriverIds.includes(vehicle.Drivers[0]?.id)
                )}
              >
                Check All Status
              </Button>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {[
                      'Type',
                      'Driver Name',
                      'Cab Name',
                      'Phone Number',
                      'Current Address',
                      'Last Location Updated',
                      'Available Status',
                      
                    ].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                    {el === 'Type' ? (
                      <FilterPopover
                        title={el}
                        options={[
                          { value: 'All', label: 'All' },
                          { value: 'CAB', label: 'Cab' },
                          { value: 'AUTO', label: 'Auto' },
                          { value: 'PARCEL', label: 'Bike' },
                        ]}
                        selectedFilters={typeFilter}
                        onFilterChange={handleFilterChange}
                      />
                    ) : (
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-black"
                        >
                          {el}
                        </Typography>
                    )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {vehicle.type || '-'}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {vehicle.Drivers?.[0]?.firstName || '-'}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {vehicle.name || '-'}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {vehicle.Drivers?.[0]?.phoneNumber || '-'}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {/* {vehicle.Shifts?.[0]?.curAddress || '-'} */
                          vehicle.Shifts?.[0]?.curAddress?.name}
                        </Typography>
                      </td>
                    <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography className="text-xs font-semibold text-blue-gray-600">
                    {vehicle.Shifts?.[0]?.updated_at
                    ? moment(vehicle.Shifts[0]?.updated_at).format('DD-MM-YYYY HH:mm')
                    : '-'}
                    </Typography>
                    </td>
                     <td className="py-3 px-5 border-b border-blue-gray-50">
                        <div className="flex items-center gap-2">
                          <Chip
                            variant="ghost"
                            color={
                              vehicle.Drivers?.length > 0 &&
                              vehicle.Drivers[0]?.status === 'ACTIVE'
                                ? 'green'
                                : 'red'
                            }
                            value={
                              vehicle.Drivers?.length > 0
                                ? vehicle.Drivers[0]?.status === 'ACTIVE'
                                  ? 'Active'
                                  : 'Offline'
                                : 'No Driver'
                            }
                            className="text-xs font-semibold"
                          />
                          {vehicle.Drivers?.length > 0 &&
                            vehicle.Drivers[0]?.status === 'ACTIVE' &&
                            !statusCheckedDriverIds.includes(vehicle.Drivers[0]?.id) && (
                              <Typography
                                className="text-xs font-semibold text-primary-900 underline cursor-pointer"
                                onClick={() => checkPresence(vehicle.Drivers[0]?.id, vehicle.id)}
                              >
                                Check Status
                              </Typography>
                            )}
                        </div>
                      </td>
                      
                    
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <Typography variant="h6" color="gray">
                        No Online Vehicles Available
                      </Typography>
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </CardBody>
      </Card>
    </div>
  );
}