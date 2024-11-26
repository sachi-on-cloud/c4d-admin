import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useEffect, useState } from "react";
import AccountSearch from "@/components/AccountSearch";
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
} from "@material-tailwind/react";
import { FaFilter } from "react-icons/fa";

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function DocumentVerificationView() {
  const [accounts, setAccounts] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [statusFilter, setStatusFilter] = useState(["All"]);

  useEffect(() => {
    const fetchDoc = async () => {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_DOCUMENT_DETAILS);
      console.log(data.data);
      if (data?.success) {
        setAccounts(data?.data);
        setAllAccounts(data?.data);
      }
    };
    fetchDoc();
  }, []);

  const getDocuments = async (searchQuery) => {
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      const filteredAccounts = allAccounts.filter((acc) => {
        const name = (acc.name || "").toLowerCase();
        return name.startsWith(query);
      });
      setAccounts(filteredAccounts);
    } else {
      setAccounts(allAccounts);
    }
  };

  const handleOpenDocument = (documentUrl) => {
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-blue-500";
      case "approved":
        return "text-green-500";
      case "declined":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };
  
  const handleStatusChange = async (id,status) => {
    const docData = {
      documentId:id,
      status : status,
    };
    const data = await ApiRequestUtils.update(API_ROUTES.GET_DOCUMENT_DETAILS, docData);
    if (data?.success) {
      alert(`Document status updated to ${status}`);
      const updatedData = await ApiRequestUtils.get(API_ROUTES.GET_DOCUMENT_DETAILS);
      if (updatedData?.success) {
        setAccounts(updatedData?.data);
        setAllAccounts(updatedData?.data);
      }
    } else {
      alert("Failed to update status. Please try again.");
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
    <div className="mt-6 mb-8 flex flex-col gap-12">
      <AccountSearch onSearch={getDocuments} addAccBtn={false} />
      <Card>
        {
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
                      "Document Type",
                      "Uploaded Date",
                      "KYC Status",
                      "",
                      "",
                    ].map((el, index) => (
                      <th
                        key={index}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                        {el==='KYC Status' ? (
                          <FilterPopover
                            title={el}
                            options={[
                              { value: "All", label: "All" },
                              { value: "PENDING", label: "Pending" },
                              { value: "APPROVED", label: "Approved" },
                              { value: "DECLINED", label: "Declined" },
                            ]}
                        />
                        ) : (
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accounts.filter((account) =>
                  statusFilter.includes("All") || statusFilter.includes(account.status)
                    ).map(
                    ({ id, name, status, type, updated_at, image1 }, key) => {
                      const className = `py-3 px-5 ${
                        key === accounts.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;
                      return (
                        <>
                          <tr key={id}>
                            <td className={className}>
                              <Typography className="text-xs font-semibold text-blue-gray-600">
                                {name}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-semibold text-blue-gray-600">
                                {type}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-semibold text-blue-gray-600">
                                {formatDate(updated_at)}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography
                                className={`text-xs font-semibold ${getStatusColor(
                                  status
                                )}`}
                              >
                                {status}
                              </Typography>
                            </td>
                            <td className={className}>
                              <div className="flex items-center gap-4">
                                <div>
                                  <Typography
                                    variant="small"
                                    className="font-semibold underline cursor-pointer text-blue-900"
                                    onClick={() => {
                                      handleOpenDocument(image1);
                                    }}
                                  >
                                    View Details
                                  </Typography>
                                </div>
                              </div>
                            </td>
                            <td className={className}>
                              <Button
                                as="a"
                                className="mr-5 text-xs font-semibold text-black bg-white border border-black"
                                onClick={() => handleStatusChange(id, 'APPROVED')}
                              >
                                Accept
                              </Button>
                              <Button
                                as="a"
                                className="text-xs font-semibold text-white"
                                onClick={() => handleStatusChange(id, 'DECLINED')}
                              >
                                Decline
                              </Button>
                            </td>
                          </tr>
                        </>
                      );
                    }
                  )}
                </tbody>
              </table>
            </CardBody>
          </>
        }
      </Card>
    </div>
  );
}