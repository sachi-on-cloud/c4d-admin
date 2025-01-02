import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
  Alert
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import DriverSearch from '@/components/DriverSearch';

export function DriverView() {
  const [drivers, setDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [alert, setAlert] = useState(false);
  // const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const paramsPassed = location.state;

  const navigate = useNavigate();
  const fetchDrivers = async () => {
    const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_DRIVERS);
    if (data?.success) {
      setDrivers(data?.data);
      setAllDrivers(data?.data);
    }
  };
  useEffect(() => {
    fetchDrivers();
  }, []);

  const getDrivers = async (searchQuery) => {
    //console.log("searchQuery",searchQuery);
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();

      const filteredDrivers = allDrivers.filter((driver) => {
        const name = (driver.firstName || "").toLowerCase();
        const phone = (driver.phoneNumber || "").toLowerCase();

        const phoneNumberWithoutCountryCode = phone.startsWith("+91") ? phone.slice(3) : phone;

        return name.startsWith(query) ||
          phoneNumberWithoutCountryCode.startsWith(query);
      });
      setDrivers(filteredDrivers);
      // const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_CUSTOMERS+`?phoneNumber=${searchQuery}`);
      // if (data?.success) {
      //   setDrivers(data?.data);
      // }
    } else {
      setDrivers(allDrivers);
    }
  };
  const updateDrivers = async (driverId, status) => {
    let driverData = {
      driverId,
      status: status == "ACTIVE" ? "NOT_ACTIVE" : "ACTIVE"
    };
    const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_DRIVERS, driverData);
    fetchDrivers('');
  };
  useEffect(() => {
    getDrivers('');
    if (paramsPassed?.driverAdded || paramsPassed?.driverUpdated) {
      setAlert(true);
      setTimeout(() => {
        setAlert(false);
      }, 2000);
    }
  }, [])

  // useEffect(() => {
  //   getDrivers(searchQuery.trim());
  // }, [searchQuery]);

  return (
    <div className="mb-8 flex flex-col gap-12">
      {alert && <div className='mb-2'>
        <Alert
          color='blue'
          className='py-3 px-6 rounded-xl'
        >
          {paramsPassed?.driverName} {paramsPassed?.driverAdded ? 'added' : 'updated'} successfully!
        </Alert>
      </div>}
      <DriverSearch onSearch={getDrivers} />
      <Card>
        {drivers.length > 0 ? (
          <>
            <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex-1 justify-between items-center">
              <Typography variant="h6" color="white">
                Drivers List
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Name", "Phone Number", "Intercity", "Outstation", "Type", "Status", ""].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(
                    ({ id, firstName, lastName, phoneNumber, email, status, intercityCount, outstationCount, curAddress, driverType }, key) => {
                      const className = `py-3 px-5 ${key === drivers.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;

                      return (
                        <tr key={id}>
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <div onClick={() => navigate(`/dashboard/drivers/details/${id}`)}>
                                <Typography
                                  variant="small"
                                  color="blue"
                                  className="font-semibold underline"
                                >
                                  {firstName}
                                </Typography>
                                {/* <Typography className="text-xs font-normal text-blue-gray-500">
                                  {email}
                                </Typography> */}
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {phoneNumber}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600 ">
                              {intercityCount}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {outstationCount}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {driverType}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Chip
                              variant="gradient"
                              color={status == "ACTIVE" ? "green" : "blue-gray"}
                              value={status == "ACTIVE" ? "online" : "offline"}
                              className="py-0.5 px-2 text-[11px] font-medium w-fit"
                            />
                          </td>
                          <div>
                            {/* <td className={className}>
                              <Button
                                as="a"
                                onClick={() => navigate(`/dashboard/drivers/details/${id}`)}
                                className="text-xs font-semibold text-white"
                              >
                                View
                              </Button>
                            </td> */}

                            {/* {status === "ACTIVE" && <td className={className}>
                              <Button
                                as="a"
                                onClick={() => navigate(`/dashboard/drivers/edit/${id}`)}
                                className="text-xs font-semibold text-white"
                              >
                                Edit
                              </Button>
                            </td>} */}
                            <td className={className}>
                              <Button
                                as="a"
                                onClick={() => { updateDrivers(id, status) }}
                                className="text-xs font-semibold text-white"
                              >
                                {status == "ACTIVE" ? "Mark Offline" : "Mark Online"}
                              </Button>
                            </td>
                          </div>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </CardBody>

          </>) : (
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              No Drivers
            </Typography>
          </CardHeader>
        )}
      </Card>
    </div >
  );
}

export default DriverView;
