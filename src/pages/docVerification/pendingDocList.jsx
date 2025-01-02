import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Popover,
  PopoverHandler,
  PopoverContent,
  Checkbox,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { FaFilter } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


export function PendingDocList() {
  const [accounts, setAccounts] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [statusFilter, setStatusFilter] = useState(["All"]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoc = async () => {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_DOCUMENT_DETAILS_LIST);
      if (data?.success) {
        setAccounts(data?.data);
        setAllAccounts(data?.data);
      }
    };
    fetchDoc();
  }, []);

  useEffect(() => {
    getDetails(searchQuery.trim());
  }, [searchQuery]);

  const getDetails = async (searchQuery) => {
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();

      const filteredAccounts = allAccounts.filter((acc) => {
        const name  = (acc['Register.firstName'] || acc['Driver.firstName'] || acc['Account.name'] || acc['Cab.name'] || "").toLowerCase();
        const phone = acc["Register.phoneNumber"] || acc["Driver.phoneNumber"] || acc["Account.phoneNumber"] || acc["Cab.phoneNumber"] || "";
        const phoneNumberWithoutCountryCode = phone.startsWith("+91") ? phone.slice(3) : phone;
        return (
          name.startsWith(query) ||
          phone.startsWith(query) ||
          phoneNumberWithoutCountryCode.startsWith(query)
        );
      });
      setAccounts(filteredAccounts);
    } else {
      setAccounts(allAccounts);
    }
  };

  const handleFilterChange = (value) => {
    setStatusFilter((prev) => {
      if (value === "All") {
        return ["All"];
      }
      const newFilter = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev.filter((item) => item !== "All"), value];
      return newFilter.length === 0 ? ["All"] : newFilter;
    });
  };

  const onClickName = ( id , type) =>{
    return navigate(`/dashboard/doc-verification/documents-details/${id}`,{
      state :{type:type},
    })
  }

  const FilterPopover = ({ title, options }) => (
    <Popover placement="bottom-start">
      <PopoverHandler>
        <div className="flex items-center cursor-pointer">
          <Typography
            variant="small"
            className="text-[11px] font-bold uppercase text-blue-gray-400 mr-1"
          >
            {title}
          </Typography>
          <FaFilter className="text-blue-gray-400 text-xs" />
        </div>
      </PopoverHandler>
      <PopoverContent className="p-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center mb-2">
            <Checkbox
              color="blue"
              checked={statusFilter.includes(option.value)}
              onChange={() => handleFilterChange(option.value)}
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
        <div className="flex items-center justify-between">
          <div className="relative flex-grow max-w-[500px]">
            <input
              type="text"
              className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search Document"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      <Card>
        {accounts.length > 0 ? (
          <>
            <CardHeader
              variant="gradient"
              color="gray"
              className="mb-8 p-6 flex-1 justify-between items-center"
            >
              <Typography variant="h6" color="white">
                Documents List
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {[
                      "Name",
                      "Type",
                      "Phone Number",
                      "KYC Status",
                    ].map((el, index) => (
                      <th
                        key={index}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                        {/* {el==='KYC Status' ? (
                          <FilterPopover
                            title={el}
                            options={[
                              { value: "All", label: "All" },
                              { value: "PENDING", label: "Pending" },
                              { value: "APPROVED", label: "Approved" },
                            ]}
                          />
                        ) : ( */}
                          <Typography
                            variant="small"
                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        {/* )} */}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accounts.filter((account) => {
                        const status = account.isComplete ? "APPROVED" : "PENDING";
                        return (
                          statusFilter.includes("All") || statusFilter.includes(status)
                        );
                      })
                      .map((data, key) => {
                        const className = `py-3 px-3 ${
                          key === accounts.length - 1 ? "" : "border-b border-blue-gray-50"
                        }`;

                        const status = data.isComplete ? "APPROVED" : "PENDING";
                        const name  = data['Register.firstName'] || data['Driver.firstName'] || data['Account.name'] || data['Cab.name'] || "";
                        const nameType = data['Register.id'] ? "Register" : data['Driver.id'] ? "Driver" : data['Account.id'] ? "Account" : data['Cab.id'] ? "Cab" : "";
                        const number = (() => {
                          const rawNumber = data["Register.phoneNumber"] || data["Driver.phoneNumber"] || data["Account.phoneNumber"] || data["Cab.phoneNumber"] || "";
                          return rawNumber ? rawNumber.startsWith("+91") ? rawNumber : `+91${rawNumber}`: "";
                        })();
                        return (
                          <>
                            <tr key={data?.id}>
                              <td className={className}>
                                <div className="flex items-center gap-4">
                                  <div onClick={() => onClickName(data.id, nameType)}>
                                    <Typography 
                                      variant="small"
                                      color="blue"
                                      className="font-semibold underline">
                                      {name}
                                    </Typography>
                                  </div>
                                </div>
                              </td>
                              <td className={className}>
                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                  {nameType}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                  {number}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Typography
                                  className={`text-xs font-semibold ${data.isComplete ? "text-green-500" : "text-blue-500"}`}
                                >
                                  {status}
                                </Typography>
                              </td>
                            </tr>
                          </>
                        );
                      }
                    )}
                </tbody>
              </table>
            </CardBody>
          </>):(
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              No Documents
            </Typography>
          </CardHeader>
        )
      }
      </Card>
    </div>
  );
}