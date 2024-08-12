import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress,
  Button
} from "@material-tailwind/react";
import { authorsTableData } from "@/data";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import DriverAddModal from '@/components/DriverAddModal';


export function DriverView() {
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const getDrivers = async (searchQuery) => {
    //console.log("searchQuery",searchQuery);
    if(searchQuery != ""){
      const phoneNumberPattern = `^\\+91${searchQuery}`;
      
      const filteredCustomers = drivers.filter((customer) =>
        new RegExp(phoneNumberPattern).test(customer.phoneNumber)
      );
      setDrivers(filteredCustomers)
      // const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_CUSTOMERS+`?phoneNumber=${searchQuery}`);
      // if (data?.success) {
      //   setDrivers(data?.data);
      // }
    }else{
      const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_DRIVERS);
      if (data?.success) {
        setDrivers(data?.data);
      }
    }
  };
  useEffect(()=>{
    getDrivers('');
  },[])
  return (
    <div className="mt-6 mb-8 flex flex-col gap-12">
      <Card>
        {drivers.length > 0 ? (
          <>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Drivers List
          </Typography>
          <button 
            onClick={()=>{setIsModalOpen(true)}}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add new
          </button>
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
                  const className = `py-3 px-5 ${
                    key === drivers.length - 1
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
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={status == "ACTIVE" ? "green" : "blue-gray"}
                          value={status == "ACTIVE" ? "online" : "offline"}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                    
                      <td className={className}>
                        <Button
                          as="a"
                          onClick={()=> {alert("hi");}}
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

        </>): (
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              No Drivers
            </Typography>
          </CardHeader>
        )}
      </Card>
      {isModalOpen && 
        <DriverAddModal openModal={isModalOpen} closeModal={closeModal}/>
      }
    </div>
  );
}

export default DriverView;
