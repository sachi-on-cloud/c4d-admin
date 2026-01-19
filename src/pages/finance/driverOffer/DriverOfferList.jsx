import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Spinner,
  Button,
  Popover,
  PopoverHandler,
  PopoverContent,
  Checkbox,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { FaFilter } from "react-icons/fa";

const FilterPopover = ({
  title,
  options,
  selectedFilters,
  onFilterChange,
  iconClassName = "text-black text-base",
}) => (
  <Popover placement="bottom-start">
    <PopoverHandler>
      <div className="flex items-center cursor-pointer">
        <Typography
          variant="small"
          className={`text-[11px] font-bold uppercase mr-1 ${ColorStyles.PopoverHandlerText}`}
        >
          {title}
        </Typography>
        <FaFilter className={iconClassName} />
      </div>
    </PopoverHandler>
    <PopoverContent className="p-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center mb-2">
          <Checkbox
            color="blue"
            checked={selectedFilters === option.value}
            onChange={() => onFilterChange(option.value)}
            className="mr-2"
          />
          <Typography color="blue-gray" className="font-medium">
            {option.label}
          </Typography>
        </div>
      ))}
    </PopoverContent>
  </Popover>
);

const DriverOfferList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab === "assign" ? "assign" : "offers"
  );
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [assignLoading, setAssignLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const fetchOffers = async (overrideFilters) => {
    try {
      setLoading(true);
      const filters =
        overrideFilters || {
          status: statusFilter,
        };

      const params = {};
      const statusParam = filters.status && filters.status !== "All" ? filters.status : undefined;

      if (statusParam) params.status = statusParam;

      const res = await ApiRequestUtils.getWithQueryParam(
        API_ROUTES.GET_DRIVER_OFFER,
        params
      );

      if (res?.success) {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data
          ? [res.data]
          : [];
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setItems(sorted);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch driver Bonus :", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setAssignLoading(true);

      const res = await ApiRequestUtils.get(API_ROUTES.GET_DRIVER_OFFER_ASSIGN);

      if (res?.success && Array.isArray(res.data)) {
        setAssignments(res.data);
      } else if (res?.success && res.data) {
        setAssignments([res.data]);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Failed to fetch driver Bonus  assignments:", error);
      setAssignments([]);
    } finally {
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchAssignments();
  }, []);

  const isOffersTab = activeTab === "offers";
  const currentLoading = isOffersTab ? loading : assignLoading;

  const handleFilterChange = (filterType, value) => {
    if (filterType === "status") {
      const next = value;
      setStatusFilter(next);
        fetchOffers({
          status: next,
      });
    }
  };

  const handleCompletedTripsClick = (assignment) => {
    setSelectedAssignment(assignment);
  };

  return (
    <div className="mb-8 flex flex-col gap-6 mt-8">
      <div className="flex items-center justify-between gap-2 mb-2 px-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            className={`rounded-xl px-4 ${
              isOffersTab ? ColorStyles.continueButtonColor : "bg-white text-black border"
            }`}
            onClick={() => setActiveTab("offers")}
          >
            Driver Bonus
          </Button>
          <Button
            size="sm"
            className={`rounded-xl px-4 ${
              !isOffersTab ? ColorStyles.continueButtonColor : "bg-white text-black border"
            }`}
            onClick={() => setActiveTab("assign")}
          >
            Offer Assign Driver
          </Button>
        </div>
        <div className="flex gap-2">
          {isOffersTab ? (
            <Button
              size="sm"
              className={`rounded-xl p-4 ${ColorStyles.continueButtonColor}`}
              onClick={() => navigate("/dashboard/users/driver-offer/add")}
            >
              Add Driver Bonus
            </Button>
          ) : (
            <Button
              size="sm"
              className={`rounded-xl p-4 ${ColorStyles.backButton}`}
              onClick={() => navigate("/dashboard/users/driver-offer/assign")}
            >
              Add Offer Assign
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader
          variant="gradient"
          className={`mb-4 p-6 rounded-xl ${ColorStyles.bgColor}`}
        >
          <Typography variant="h6" color="white">
            Driver Bonus List
          </Typography>
        </CardHeader>
        <CardBody className="pt-0 px-0">
          {currentLoading ? (
            <div className="flex justify-center items-center py-10">
              <Spinner className="h-12 w-12" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              {isOffersTab ? (
                <table className="w-full min-w-[1100px] table-auto">
                  <thead>
                    <tr>
                      <th className="py-3 px-5 text-left">Title</th>
                      <th className="py-3 px-5 text-left">Start Date</th>
                      <th className="py-3 px-5 text-left">End Date</th>
                      <th className="py-3 px-5 text-left">Trip Target</th>
                      <th className="py-3 px-5 text-left">Amount</th>
                       <th className="py-3 px-5 text-left">
                        <FilterPopover
                          title="Status"
                          options={[
                            { value: "All", label: "All" },
                            { value: "ACTIVE", label: "Active" },
                            { value: "IN_ACTIVE", label: "In Active" },
                          ]}
                          selectedFilters={statusFilter}
                          onFilterChange={(value) =>
                            handleFilterChange("status", value)
                          }
                        />
                      </th>
                      <th className="py-3 px-5 text-left">Created At</th>
                      <th className="py-3 px-5 text-left">Start Message</th>
                      <th className="py-3 px-5 text-left">Mid Message</th>
                      <th className="py-3 px-5 text-left">End Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="py-4 px-5 text-center text-gray-600"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr
                          key={item.id || item.created_at}
                          className="border-b"
                        >
                          <td className="py-3 px-5">{item.title || "-"}</td>
                          <td className="py-3 px-5">
                            {item.startDate
                              ? moment(item.startDate).format("DD-MM-YYYY")
                              : "-"}
                          </td>
                          <td className="py-3 px-5">
                            {item.endDate
                              ? moment(item.endDate).format("DD-MM-YYYY")
                              : "-"}
                          </td>
                          <td className="py-3 px-5">
                            {item.tripTarget || "-"}
                          </td>
                          <td className="py-3 px-5">{item.amount || "-"}</td>
                          <td className="py-3 px-5">
                            <Chip
                              variant="ghost"
                              color={
                                item.status === "ACTIVE"
                                  ? "green"
                                  : item.status === "IN_ACTIVE"
                                  ? "red"
                                  : "blue-gray"
                              }
                              value={item.status || "-"}
                              className="py-0.5 px-2 text-[11px] font-medium w-fit"
                            />
                          </td>
                          <td className="py-3 px-5">
                            {item.created_at
                              ? moment(item.created_at).format(
                                  "DD-MM-YYYY HH:mm"
                                )
                              : "-"}
                          </td>
                          <td className="py-3 px-5">{item.startMsg || "-"}</td>
                          <td className="py-3 px-5">{item.midMsg || "-"}</td>
                          <td className="py-3 px-5">{item.endMsg || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full  table-auto">
                  <thead>
                    <tr>
                      <th className="py-3 px-5 text-left">Offer Title</th>
                      <th className="py-3 px-5 text-left">Trip Target</th>
                      <th className="py-3 px-5 text-left">completed Trips</th>
                      <th className="py-3 px-5 text-left">Amount</th>
                      <th className="py-3 px-5 text-left">Offer Message</th>
                      <th className="py-3 px-5 text-left">Driver Name</th>
                      <th className="py-3 px-5 text-left">Driver Phone</th>
                      <th className="py-3 px-5 text-left">Status</th>
                      <th className="py-3 px-5 text-left">Assigned At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-4 px-5 text-center text-gray-600"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      assignments.map((row, index) => {
                        const offer = row.offer || row.driverOffer || {};
                        const driver =
                          row.driver ||
                          row.Driver ||
                          row.account ||
                          row.driverAccount ||
                          {};
                        const title =
                          row.offerTitle || offer.title || "Offer";
                        const serviceType =
                          row.serviceType || offer.serviceType || "-";
                        const serviceArea =
                          row.serviceArea || offer.serviceArea || "-";
                        const tripTarget =
                          row.tripTarget || offer.tripTarget || "-";
                        const amount = row.amount || offer.amount || "-";
                        const driverId =
                          row.driverId ||
                          driver.id ||
                          driver.driverId ||
                          null;
                        const baseDriverName =
                          row.driverName ||
                          driver.name ||
                          driver.firstName ||
                          "";
                        const driverName =
                          baseDriverName && driverId
                            ? `DriverId # ${driverId} - ${baseDriverName}`
                            : baseDriverName || (driverId ? `Driver #${driverId}` : "-");
                        const driverPhone =
                          row.driverPhone ||
                          driver.phoneNumber ||
                          driver.mobile ||
                          "-";
                        const status =
                          row.status || offer.status || row.offerStatus || "-";
                        const completedTrips = row.completedTrips || 0;
                        const offerMessage =
                          tripTarget && amount && tripTarget !== "-" && amount !== "-"
                            ? `complete ${tripTarget} rides get ${amount}`
                            : "-";
                        const assignedAt =
                          row.created_at || row.assignedAt || null;

                        return (
                          <tr
                            key={row.id || `${row.offerId}-${row.driverId}-${index}`}
                            className="border-b"
                          >
                            <td className="py-3 px-5">{title}</td>
                            <td className="py-3 px-5">{tripTarget}</td>
                            <td className="py-3 px-5">
                              {completedTrips > 0 ? (
                                <button
                                  type="button"
                                  className="text-blue-600 underline"
                                  onClick={() => handleCompletedTripsClick(row)}
                                >
                                  {completedTrips}
                                </button>
                              ) : (
                                completedTrips
                              )}
                            </td>
                            <td className="py-3 px-5">{amount}</td>
                            <td className="py-3 px-5">{offerMessage}</td>
                            <td className="py-3 px-5">{driverName}</td>
                            <td className="py-3 px-5">{driverPhone}</td>
                            <td className="py-3 px-5">
                              <Chip
                                variant="ghost"
                                color={
                                  status === "ACHIEVED"
                                    ? "green"
                                    : status === "IN_PROGRESS"
                                    ? "amber"
                                    : status === "ASSIGNED"
                                    ? "blue"
                                    : status === "EXPIRED"
                                    ? "red"
                                    : "blue-gray"
                                }
                                value={status || "-"}
                                className="py-0.5 px-2 text-[11px] font-medium w-fit"
                              />
                            </td>
                            <td className="py-3 px-5">
                              {assignedAt
                                ? moment(assignedAt).format(
                                    "DD-MM-YYYY HH:mm"
                                  )
                                : "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardBody>
      </Card>
	      {selectedAssignment && (
	        <Dialog
	          open={Boolean(selectedAssignment)}
	          handler={() => setSelectedAssignment(null)}
	          size="sm"
	          className="bg-white rounded-t-3xl"
	        >
	          <DialogHeader className="flex justify-between items-center p-4 border-b border-gray-200">
	            <Typography
	              variant="h6"
	              className="text-lg font-roboto-bold text-black"
	            >
	              Trip Details
	            </Typography>
	            <Button
	              variant="text"
	              className="p-2"
	              onClick={() => setSelectedAssignment(null)}
	            >
	              X
	            </Button>
	          </DialogHeader>
	          <DialogBody className="flex-1 flex flex-col justify-left items-left p-4">
	            <Typography className="text-left text-base text-gray-700">
	              Booking Number : {(selectedAssignment.bookingIds || []).join(", ")}
	            </Typography>
	          </DialogBody>
	        </Dialog>
	      )}
    </div>
  );
};

export default DriverOfferList;
