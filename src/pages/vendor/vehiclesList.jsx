import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Popover,
  PopoverHandler,
  PopoverContent,
  Checkbox,
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import moment from "moment";
import { FaFilter } from "react-icons/fa";

export function VehiclesList() {
  const [vehicleList, setVehicleList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(["All"]);
  const [subScriptionStatusFilter, setSubScriptionStatusFilter] = useState(["All"]);
  const [typeFilter, setTypeFilter] = useState(["All"]);
  const navigate = useNavigate();

  const fetchCabList = async () => {
    const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_VEHICLESLIST);
    if (data?.success) {
      setVehicleList(data.data || []); 
    }
  };

  useEffect(() => {
    fetchCabList();
  }, []);

const filteredVehicles = vehicleList.filter((vehicle) => {
  const matchesSearch = ['name', 'carNumber', 'driverName'].some((field) => {
    if (field === 'carNumber') {
      const fieldValue = vehicle[field]?.toString().replace(/\s/g, '');
      const query = searchQuery.replace(/\s/g, '');
      return fieldValue?.includes(query);
    } else {
      const fieldValue = vehicle[field]?.toString().toLowerCase();
      const query = searchQuery.toLowerCase();
      return fieldValue?.includes(query);
    }
  });

  const status = vehicle.Drivers[0]?.status || '';
  const carType = vehicle.carType || '';
    const subscriptionStatus = vehicle.subscriptionStatus || '';

  return (
    matchesSearch &&
    (statusFilter.includes('All') || statusFilter.includes(status)) &&
    (typeFilter.includes('All') || typeFilter.includes(carType))&&
    (subScriptionStatusFilter.includes('All') || subScriptionStatusFilter.includes(subscriptionStatus) )
);
})

  const handleFilterChange = (filterType, value) => {
    if (filterType === "Drivers") {
      setStatusFilter((prev) => {
        if (value === "All") return ["All"];
        const newFilter = prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev.filter((item) => item !== "All"), value];
        return newFilter.length === 0 ? ["All"] : newFilter;
      });
    } else if (filterType === "carType") {
      setTypeFilter((prev) => {
        if (value === "All") return ["All"];
        const newFilter = prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev.filter((item) => item !== "All"), value];
        return newFilter.length === 0 ? ["All"] : newFilter;
      });
    }
    else if(filterType === "subscriptionStatus")
    {
      setSubScriptionStatusFilter((prev) => {
        if (value === "All") return ["All"];
        const newFilter = prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev.filter((item) => item !== "All"), value];
        return newFilter.length === 0 ? ["All"] : newFilter;
      });
    }
  };
  const FilterPopover = ({ title, options, selectedFilters, onFilterChange }) => (
    <Popover placement="bottom-start">
      <PopoverHandler>
        <div className="flex items-center cursor-pointer">
          <Typography
            variant="small"
            className="text-[11px] font-bold uppercase text-black mr-1"
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
              checked={selectedFilters.includes(option.value)}
              onChange={() => onFilterChange(option.value)}
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
      <div className="p-4 border border-gray-300 rounded-lg shadow-sm">
        <div className="relative flex-grow max-w-[500px]">
          <input
            type="text"
            className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search vehicle"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <Card>
        {filteredVehicles.length > 0 ? (
          <>
            <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex justify-between items-center">
              <Typography variant="h6" color="white">Vehicles</Typography>
              <Typography variant="h6" color="white">{filteredVehicles.length} vehicles found</Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Driver Name", "Cab Name", "Vehicle Type", "Vehicle Number", "Registration Date", "Available Status","Subscription Status"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                        {el === "Vehicle Type" ? (
                          <FilterPopover
                            title={el}
                            options={[
                              { value: "All" , label: "All"}, 
                              { value: "MINI", label: "Mini" },
                              { value: "MUV", label: "Muv" },
                              { value: "Sedan", label: "Sedan" },
                              { value: "SUV", label: "Suv" },
                            ]}
                            selectedFilters={typeFilter}
                            onFilterChange={(value) => handleFilterChange("carType", value)}
                          />
                        ) : el === "Subscription Status"  ? (
                          <FilterPopover
                            title={el}
                            options={[
                              { value: "All" , label: "All"},
                              { value: "ACTIVE", label: "Active" },
                              { value: "IN_ACTIVE", label: "In_Active" },
                            ]}
                            selectedFilters={subScriptionStatusFilter}
                            onFilterChange={(value) => handleFilterChange("subscriptionStatus", value)}
                          />
                        ) : 
                        el === "Available Status" ? (
                          <FilterPopover
                            title={el}
                            options={[
                              { value: "All" , label: "All"},
                              { value: "ACTIVE", label: "Active" },
                              { value: "IN_ACTIVE", label: "In_Active" },
                            ]}
                            selectedFilters={statusFilter} 
                            onFilterChange={(value) => handleFilterChange("Drivers" , value)}
                          />
                        )
                        : (
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
                  {filteredVehicles.map(({ id, driverName, name, vehicleType, carType, type, assigned, Account, carNumber, Drivers, subscriptionStatus, status, created_at }) => (
                    <tr key={id}>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">{driverName || Account?.name}</Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <div
                          className="underline cursor-pointer text-blue-600"
                          onClick={() => navigate(`/dashboard/vendors/account/allVehicles/details/${id}`)}
                        >
                          <Typography className="text-xs font-semibold text-blue-600">{name}</Typography>
                        </div>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">{carType}</Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">{carNumber}</Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {moment(created_at).format('DD-MM-YYYY / hh:mm A')}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Chip
                          variant="ghost"
                          color={Drivers[0]?.status === "ACTIVE" ? "green" : "blue-gray"}
                          value={Drivers[0]?.status === "ACTIVE" ? "Active" : "In_Active"}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Chip
                          variant="ghost"
                          color={subscriptionStatus === "ACTIVE" ? "green" : "blue-gray"}
                          value={subscriptionStatus === "ACTIVE" ? "Active" : "In_Active"}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </>
        ) : (
          <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
            <Typography variant="h6" color="white">No Vehicles Available</Typography>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}