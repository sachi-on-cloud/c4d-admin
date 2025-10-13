import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Typography, Button, Spinner, Input } from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Popover, PopoverHandler, PopoverContent } from "@material-tailwind/react";
import moment from "moment";

export function ExotelCallsList() {
  const [callList, setCallList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDateFilterPopoverOpen, setIsDateFilterPopoverOpen] = useState(false);
  const [startTimeFrom, setStartTimeFrom] = useState('');
  const [startTimeTo, setStartTimeTo] = useState('');

  const callsList = async (showLoader = false, values = {}) => {
    if (showLoader) setLoading(true);
    try {
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.EXOTEL_CALL_LOGS, {
        StartTimeFrom: values.from || '',
        StartTimeTo: values.to || '',
        limit: values.limit || 15,
        offset: values.offset || 0,
      });
      if (data?.success) {
        setCallList(data.data || []);
      } else {
        console.error('API request failed:', data?.message);
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    callsList();
  }, []);

  useEffect(() => {
    if (startTimeFrom && startTimeTo) {
      callsList(true, { from: startTimeFrom, to: startTimeTo });
    }
  }, [startTimeFrom, startTimeTo]);

  const handleResetFilters = () => {
    setStartTimeFrom('');
    setStartTimeTo('');
    setIsDateFilterPopoverOpen(false);
    callsList(true);
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
                    min={`${moment().format('YYYY-MM-DD')}T hh:mm:ss`}
                    max={`${moment().format('YYYY-MM-DD')}T hh:mm:ss`}
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
                    min={startTimeFrom || `${moment().format('YYYY-MM-DD')}T hh:mm`}
                    max={`${moment().format('YYYY-MM-DD')}T hh:mm`}
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
                    "Date Created", 
                    "Date Updated", 
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
                      <td colSpan={7} className="py-3 px-5">
                        <div className="flex justify-center items-center">
                          <Spinner className="h-12 w-12" />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    callList.map(
                      ({ id, 
                        sid,
                        parentCallSid,
                        dateCreated,
                        dateUpdated,
                        accountSid,
                        to,
                        from,
                        phoneNumber,
                        phoneNumberSid,
                        status,
                        startTime,
                        endTime,
                        duration,
                        price,
                        direction,
                        answeredBy,
                        forwardedFrom,
                        callerName,
                        uri,
                        customField,
                        recordingUrl,  
                      }) => (
                        <tr key={id}>
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{sid}</Typography>
                          </td> */}
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{parentCallSid || '-'}</Typography>
                          </td> */}
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{moment(startTime).format('DD-MM-YYYY HH:MM') || '-'}</Typography>
                          </td>
                            <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{moment(endTime).format('DD-MM-YYYY HH:MM') || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{moment(dateCreated).format("DD-MM-YYYY HH:MM") || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{moment(dateUpdated).format("DD-MM-YYYY HH:MM") || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{accountSid|| '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{to|| '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{from|| '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{phoneNumber|| '-'}</Typography>
                          </td>
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{phoneNumberSid || '-'}</Typography>
                          </td> */}
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{status || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{duration || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{price || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{direction || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{answeredBy || '-'}</Typography>
                          </td>
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{forwardedFrom || '-'}</Typography>
                          </td> */}
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{callerName || '-'}</Typography>
                          </td> */}
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{uri || '-'}</Typography>
                          </td> */}
                          {/* <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{customField || '-'}</Typography>
                          </td> */}
                          {/* <td>
                          {recordingUrl ? (
                              <audio controls className="w-full max-w-[200px]">
                                <source src={recordingUrl} type="audio/mpeg" />
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