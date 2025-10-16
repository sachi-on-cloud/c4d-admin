import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Typography, Button, Spinner, Input,Chip  } from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Popover, PopoverHandler, PopoverContent } from "@material-tailwind/react";
import moment from "moment";

const ExotelCallsList = () => {
  const [callList, setCallList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDateFilterPopoverOpen, setIsDateFilterPopoverOpen] = useState(false);
  const [startTimeFrom, setStartTimeFrom] = useState('');
  const [startTimeTo, setStartTimeTo] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
  });

  const callsList = async (page = 1, showLoader = false, values = {}) => {
    if (showLoader) setLoading(true);
    try {
      const queryParams = {
        StartTimeFrom: values.from ? new Date(values.from).toISOString() : '',
        StartTimeTo: values.to ? new Date(values.to).toISOString() : '',
        limit: pagination.itemsPerPage,
        page: page,
      };
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.EXOTEL_CALL_LOGS, queryParams);
      console.log('API Response:', data);
      if (data?.success && Array.isArray(data.data)) {
        setCallList(data.data);
        setPagination({
          currentPage: data?.pagination?.currentPage || page,
          totalPages: data?.pagination?.totalPages || Math.ceil((data?.pagination?.totalItems || data.data.length) / pagination.itemsPerPage),
          totalItems: data?.pagination?.totalItems || data.data.length,
          itemsPerPage: data?.pagination?.itemsPerPage || pagination.itemsPerPage,
        });
      } else {
        console.error('API request failed or data is not an array:', data?.message);
        setCallList([]);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
      setCallList([]);
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    callsList(pagination.currentPage, true);
  }, [pagination.currentPage]);

  useEffect(() => {
    if (startTimeFrom && startTimeTo) {
      callsList(1, true, { from: startTimeFrom, to: startTimeTo });
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [startTimeFrom, startTimeTo]);

  const handleResetFilters = () => {
    setStartTimeFrom('');
    setStartTimeTo('');
    setIsDateFilterPopoverOpen(false);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    callsList(1, true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
  };

  const generatePageButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          variant={i === pagination.currentPage ? "filled" : "outlined"}
          className={`mx-1 ${i === pagination.currentPage ? 'bg-blue-500 text-white' : 'border-blue-500 text-blue-500'}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return buttons;
  };

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Typography variant="small" className="text-gray-600 font-semibold">
            Filter by Date Range
          </Typography>
          <Popover placement="bottom-start" open={isDateFilterPopoverOpen} handler={setIsDateFilterPopoverOpen}>
            <PopoverHandler>
              <div className="flex items-center cursor-pointer">
                <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                <Typography variant="small" className="ml-2 text-gray-600">
                  {startTimeFrom && startTimeTo
                    ? `${moment(startTimeFrom).format('DD-MM-YYYY HH:mm:ss')} to ${moment(startTimeTo).format('DD-MM-YYYY HH:mm:ss')}`
                    : 'Select Date Range'}
                </Typography>
              </div>
            </PopoverHandler>
            <PopoverContent className="p-4 z-10 bg-white shadow-lg rounded-lg w-auto">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Typography variant="small" className="text-gray-600 w-auto">
                    From:
                  </Typography>
                  <input
                    type="datetime-local"
                    value={startTimeFrom}
                    onChange={(e) => setStartTimeFrom(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm flex-1"
                  />
                  <Typography variant="small" className="text-gray-600 w-auto">
                    To:
                  </Typography>
                  <input
                    type="datetime-local"
                    value={startTimeTo}
                    onChange={(e) => setStartTimeTo(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    min={startTimeFrom}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm flex-1"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex justify-end gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                </div>
        </div>
      </div>
      <Card>
        {callList.length > 0 ? (
          <>
            <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex justify-between items-center">
              <Typography variant="h6" color="white">Call Logs</Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {[
                    // "sid", 
                    // "Parent Call Sid", 
                    "Start Time",
                    "End Time", 
                    // "Date Created", 
                    // "Date Updated", 
                    "Account Sid", 
                    "To", 
                    "From",
                    "Phone Number",
                    // "phone Number Sid",
                    "Status",
                    "Duration",
                    "Price",
                    "Direction",
                    "Answered By",
                    // "Forwarded From",
                    // "Caller Name",
                    // "uri",
                    // "Custom Field",
                    // "recordingUrl",

                  ].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-black"
                        >
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="py-3 px-5">
                        <div className="flex justify-center items-center">
                          <Spinner className="h-12 w-12" />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    callList.map(
                      ({
                        id,
                        CallSid,
                        ParentCallSid,
                        DateCreated,
                        DateUpdated,
                        AccountSid,
                        To,
                        From,
                        PhoneNumber,
                        PhoneNumberSid,
                        CallStatus,
                        StartTime,
                        EndTime,
                        Duration,
                        Price,
                        Direction,
                        AnsweredBy,
                        ForwardedFrom,
                        CallerName,
                        Uri,
                        CustomField,
                        RecordingUrl,
                      }) => (
                        <tr key={id}>
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{CallSid}</Typography>
                          </td> */}
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{ParentCallSid || '-'}</Typography>
                          </td> */}
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{moment(StartTime).format('DD-MM-YYYY HH:mm') || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{moment(EndTime).format('DD-MM-YYYY HH:mm') || '-'}</Typography>
                          </td>
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{moment(DateCreated).format("DD-MM-YYYY HH:mm") || '-'}</Typography>
                          </td> */}
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{moment(DateUpdated).format("DD-MM-YYYY HH:mm") || '-'}</Typography>
                          </td> */}
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{AccountSid || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{To || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{From || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{PhoneNumber || '-'}</Typography>
                          </td>
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{PhoneNumberSid || '-'}</Typography>
                          </td> */}
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Chip
                              variant="ghost"
                              value={CallStatus || "-"}
                              className={`py-0.5 px-2 text-[11px] font-medium w-fit 
                                ${CallStatus === "completed"
                                ? "bg-green-600 text-white"
                                : CallStatus === "failed"
                                  ? "bg-red-600 text-white"
                                  : CallStatus === 'buys' ? "bg-yellow-600" : "bg-blue-gray-600 text-white"
                                }`}
                            />
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{Duration || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{Price || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{Direction || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{AnsweredBy || '-'}</Typography>
                          </td>
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{ForwardedFrom || '-'}</Typography>
                          </td> */}
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{CallerName || '-'}</Typography>
                          </td> */}
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{Uri || '-'}</Typography>
                          </td> */}
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{CustomField || '-'}</Typography>
                          </td> */}
                          {/* <td>
                            {RecordingUrl ? (
                              <audio controls className="w-full max-w-[200px]">
                                <source src={RecordingUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            ) : (
                              <Typography className="text-xs font-semibold text-blue-gray-600">No Audio</Typography>
                            )}
                          </td> */}
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{}</Typography>
                          </td> */}
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
              <div className="flex items-center justify-center mt-4">
                <Button
                  size="sm"
                  variant="text"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="mx-1"
                >
                  {"<"}
                </Button>
                {generatePageButtons()}
                <Button
                  size="sm"
                  variant="text"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="mx-1"
                >
                  {">"}
                </Button>
              </div>
            </CardBody>
          </>
        ) : (
          <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
            <Typography variant="h6" color="white">No Call Records Available</Typography>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}
export default ExotelCallsList;