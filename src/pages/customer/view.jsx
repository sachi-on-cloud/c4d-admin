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
  const [allCustomers, setAllCustomers] = useState([]);
  const [alert, setAlert] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_CUSTOMERS);
      if (data?.success) {
        setCustomers(data?.data);
        setAllCustomers(data?.data);
      }
    };
    fetchCustomers();

    if (location.state?.customerAdded || location.state?.customerUpdated) {
      const action = location.state.customerAdded ? 'added' : 'updated';
      setAlert({
        message: `${location.state.customerName} ${action} successfully!`
      });
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      // Clear the state to prevent showing the alert on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const getCustomers = async (searchQuery) => {
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();

      const filteredCustomers = allCustomers.filter((customer) => {
        const name = (customer.firstName || "").toLowerCase();
        const phone = (customer.phoneNumber || "").toLowerCase();

        const phoneNumberWithoutCountryCode = phone.startsWith("+91") ? phone.slice(3) : phone;

        return name.startsWith(query) || 
               phoneNumberWithoutCountryCode.startsWith(query);
      });
      setCustomers(filteredCustomers);
      
    } else {
      setCustomers(allCustomers);
    }
  };

  function formatPhoneNumber(phoneNumber) {
    if(phoneNumber){if (phoneNumber.startsWith("+91")) {
      return phoneNumber;
    }
    return `+91${phoneNumber}`;}
  }

  // useEffect(() => {
  //   if (paramsPassed?.customerAdded) {
  //     setAlert(true);
  //     setTimeout(() => {
  //       setAlert(false);
  //     }, 2000);
  //   }
  // }, []);
  return (
    <div className="mt-6 mb-8 flex flex-col gap-12">
      {alert && (
        <div className='mb-2'>
        <Alert
          color='blue'
          className='py-3 px-6 rounded-xl'
        >
          {alert.message}
        </Alert>
      </div>)}
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
                              <div onClick={() => navigate(`/dashboard/customers/details/${id}`)}>
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
                              {formatPhoneNumber(phoneNumber)}
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
                            {/* <Button
                              as="a"
                              onClick={() => navigate(`/dashboard/customers/details/${id}`)}
                              className="text-xs font-semibold text-white mr-3"
                            >
                              View
                            </Button> */}
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
