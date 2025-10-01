import React, { useEffect, useState, useCallback } from 'react';
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
  Spinner,
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import { useNavigate } from 'react-router-dom';
import moment from "moment";
import { FaFilter } from "react-icons/fa";
import ParcelSearch from '@/components/ParcelSearch';

export function ParcelDetailsList({ id = 0 }) {
  const [parcelList, setParcelList] = useState([]);
  const [statusFilter, setStatusFilter] = useState(["All"]);
  const [documentStatusFilter, setDocumentStatusFilter] = useState(["All"]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Memoize fetchParcelList to prevent unnecessary re-creations
  const fetchParcelList = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_ALL_ACCOUNTS, {
        serviceType: "Parcel",
        // Removed page and limit since pagination is not needed
      });
      console.log("API Response:", data);
      if (data?.success) {
        setParcelList(data.data || []);
      } else {
        console.error('API request failed:', data?.message);
      }
    } catch (error) {
      console.error('Error fetching parcel list:', error);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies since pagination and filters are handled client-side

  // Fetch data when id changes or filters change
  useEffect(() => {
    fetchParcelList(true);
  }, [id, statusFilter, documentStatusFilter, fetchParcelList]);

  const handleFilterChange = (filterType, value) => {
    if (filterType === "Status") {
      setStatusFilter((prev) => {
        if (value === "All") return ["All"];
        const newFilter = prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev.filter((item) => item !== "All"), value];
        return newFilter.length === 0 ? ["All"] : newFilter;
      });
    } else if (filterType === "DocumentStatus") {
      setDocumentStatusFilter((prev) => {
        if (value === "All") return ["All"];
        const newFilter = prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev.filter((item) => item !== "All"), value];
        return newFilter.length === 0 ? ["All"] : newFilter;
      });
    }
  };

  const getFilteredData = () => {
    return parcelList.filter(parcel =>
      (statusFilter.includes('All') || statusFilter.includes(parcel?.ownerStatus)) &&
      (documentStatusFilter.includes('All') || documentStatusFilter.includes(parcel?.documentStatus?.status))
    );
  };

  const filteredData = getFilteredData();

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
      <ParcelSearch />
      <Card>
        {loading ? (
          <CardBody>
            <div className="flex justify-center items-center">
              <Spinner className="h-12 w-12" />
            </div>
          </CardBody>
        ) : parcelList.length > 0 ? (
          <>
            <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex justify-between items-center">
              <Typography variant="h6" color="white">Owner List</Typography>
              {/* <Typography variant="small" color="white">
                Showing {filteredData.length} entries
              </Typography> */}
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Name", "Phone Number", "Email", "Type", "Source", "Created Date", "Status", "KYC Status"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                        {el === "KYC Status" ? (
                          <FilterPopover
                            title={el}
                            options={[
                              { value: "All", label: "All" },
                              { value: "PENDING", label: "Pending" },
                              { value: "VERIFIED", label: "Verified" }, // Updated to match API
                              { value: "DECLINED", label: "Declined" },
                            ]}
                            selectedFilters={documentStatusFilter}
                            onFilterChange={(value) => handleFilterChange("DocumentStatus", value)}
                          />
                        ) : el === "Status" ? (
                          <FilterPopover
                            title={el}
                            options={[
                              { value: "All", label: "All" },
                              { value: "ACTIVE", label: "Active" },
                              { value: "IN_ACTIVE", label: "In_Active" },
                            ]}
                            selectedFilters={statusFilter}
                            onFilterChange={(value) => handleFilterChange("Status", value)}
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
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-3 px-5 text-center">
                        <Typography className="text-sm font-semibold text-blue-gray-600">
                          No results match the selected filters.
                        </Typography>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map(
                      ({ id, name, phoneNumber, email, type, source, ownerStatus, documentStatus, created_at }) => (
                        <tr key={id}>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <div
                              className="underline cursor-pointer text-blue-600"
                              onClick={() => navigate(`/dashboard/vendors/account/parcel/details/${id}`)}
                            >
                              <Typography className="text-xs font-semibold text-blue-600">{name}</Typography>
                            </div>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{phoneNumber || "-"}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{email || "-"}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{type}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{source || "-"}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {moment(created_at).format('DD-MM-YYYY / hh:mm A')}
                            </Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Chip
                              variant="ghost"
                              color={ownerStatus === "ACTIVE" ? "green" : "blue-gray"}
                              value={ownerStatus === "ACTIVE" ? "Active" : "In_Active"}
                              className="py-0.5 px-2 text-[11px] font-medium w-fit"
                            />
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Chip
                              variant="ghost"
                              color={documentStatus?.status === "VERIFIED" ? "green" : documentStatus?.status === "DECLINED" ? "red" : "blue-gray"}
                              value={documentStatus?.status === "VERIFIED" ? "Verified" : documentStatus?.status === "DECLINED" ? "Declined" : "Pending"}
                              className="py-0.5 px-2 text-[11px] font-medium w-fit"
                            />
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </CardBody>
          </>
        ) : (
          <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
            <Typography variant="h6" color="white">Not Available</Typography>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}

export default ParcelDetailsList;