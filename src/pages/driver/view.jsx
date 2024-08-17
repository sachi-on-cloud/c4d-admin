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


export function DriverView() {
  const [drivers, setDrivers] = useState([]);
  const [alert, setAlert] = useState(false);

  const location = useLocation();
  const paramsPassed = location.state;

  const navigate = useNavigate();

  const getDrivers = async (searchQuery) => {
    //console.log("searchQuery",searchQuery);
    if (searchQuery != "") {
      const phoneNumberPattern = `^\\+91${searchQuery}`;

      const filteredCustomers = drivers.filter((customer) =>
        new RegExp(phoneNumberPattern).test(customer.phoneNumber)
      );
      setDrivers(filteredCustomers)
      // const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_CUSTOMERS+`?phoneNumber=${searchQuery}`);
      // if (data?.success) {
      //   setDrivers(data?.data);
      // }
    } else {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_DRIVERS);
      if (data?.success) {
        setDrivers(data?.data);
      }
    }
  };
  const updateDrivers = async (driverId, status) => {
    let driverData = {
      driverId,
      status: status == "ACTIVE" ? "NOT_ACTIVE" : "ACTIVE"
    };
    const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_DRIVERS, driverData);
    getDrivers('');
  };
  useEffect(() => {
    getDrivers('');
    if (paramsPassed?.driverAdded) {
      setAlert(true);
      setTimeout(() => {
        setAlert(false);
      }, 2000);
    }
  }, [])

  return (
    <div className="mt-6 mb-8 flex flex-col gap-12">
      {alert && <div className='mb-2'>
        <Alert
          color='blue'
          className='py-3 px-6 rounded-xl'
        >
          {paramsPassed?.driverName} added successfully!
        </Alert>
      </div>}
      <div className='flex justify-end mr-5'>
        <button
          onClick={() => navigate('/dashboard/drivers/add')}
          className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add new
        </button>
      </div>
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
                    {["Name", "Phone Number", "Status", ""].map((el) => (
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
                    ({ id, firstName, lastName, phoneNumber, email, status }, key) => {
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

                            <td className={className}>
                              <Button
                                as="a"
                                onClick={() => navigate(`/dashboard/drivers/edit/${id}`)}
                                className="text-xs font-semibold text-white"
                              >
                                Edit
                              </Button>
                            </td>
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
