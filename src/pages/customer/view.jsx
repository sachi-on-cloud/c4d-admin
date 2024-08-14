import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Alert
} from "@material-tailwind/react";
import CustomerSearch from "@/components/CustomerSearch";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';


export function CustomerView() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [alert, setAlert] = useState(false);

  const location = useLocation();
  const paramsPassed = location.state;

  const getCustomers = async (searchQuery) => {
    //console.log("searchQuery",searchQuery);
    if (searchQuery != "") {
      const phoneNumberPattern = `^\\+91${searchQuery}`;

      const filteredCustomers = customers.filter((customer) =>
        new RegExp(phoneNumberPattern).test(customer.phoneNumber)
      );
      setCustomers(filteredCustomers)
      // const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_CUSTOMERS+`?phoneNumber=${searchQuery}`);
      // if (data?.success) {
      //   setCustomers(data?.data);
      // }
    } else {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_CUSTOMERS);
      if (data?.success) {
        setCustomers(data?.data);
      }
    }
  };

  useEffect(() => {
    if (paramsPassed?.customerAdded) {
      setAlert(true);
      setTimeout(() => {
        setAlert(false);
      }, 2000);
    }
  }, []);
  return (
    <div className="mt-6 mb-8 flex flex-col gap-12">
      {alert && <div className='mb-2'>
        <Alert
          color='blue'
          className='py-3 px-6 rounded-xl'
        >
          {paramsPassed?.customerName} added successfully!
        </Alert>
      </div>}
      <CustomerSearch onSearch={getCustomers} />
      <Card>
        {customers.length > 0 ? (
          <>
            <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
              <Typography variant="h6" color="white">
                Customers List
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Name", "Phone Number", ""].map((el) => (
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
                  {customers.map(
                    ({ id, firstName, lastName, phoneNumber, email }, key) => {
                      const className = `py-3 px-5 ${key === customers.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;

                      return (
                        <tr key={id}>
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <div>
                                <Typography
                                  variant="small"
                                  color="blue-gray"
                                  className="font-semibold"
                                >
                                  {firstName}
                                </Typography>
                                <Typography className="text-xs font-normal text-blue-gray-500">
                                  {email}
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {phoneNumber}
                            </Typography>
                          </td>
                          {/* <td className={className}>
                        <Chip
                          variant="gradient"
                          color={online ? "green" : "blue-gray"}
                          value={online ? "online" : "offline"}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          
                        </Typography>
                      </td> */}
                          <td className={className}>
                            <Button
                              as="a"
                              onClick={() => navigate(`/dashboard/customers/details/${id}`)}
                              className="text-xs font-semibold text-white mr-3"
                            >
                              View
                            </Button>
                            <Button
                              as='a'
                              onClick={() => navigate(`/dashboard/customers/edit/${id}`)}
                              className="text-xs font-semibold text-white"
                            >
                              Edit
                            </Button>
                          </td>
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
              No Customers
            </Typography>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}

export default CustomerView;
