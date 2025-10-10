import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Typography, Button, Spinner, Input } from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import moment from "moment";

export function ExotelCallsList() {
  const [callList, setCallList] = useState([]);
  const [loading, setLoading] = useState(false);

 
  const callsList = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.EXOTEL_CALL_LOGS);
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


  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="p-4 rounded-lg shadow-sm">
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
                    "Date Created", 
                    "Date Updated", 
                    "Account Sid", 
                    "To", 
                    "From",
                    "Phone Number",
                    // "phone Number Sid",
                    "Status",
                    "Start Time",
                    "End Time",
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
                            <Typography className="text-xs font-semibold text-blue-gray-600">{moment(startTime).format('DD-MM-YYYY HH:MM') || '-'}</Typography>
                          </td>
                            <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{moment(endTime).format('DD-MM-YYYY HH:MM') || '-'}</Typography>
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