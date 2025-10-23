import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Typography, Button, Spinner, Input, Chip } from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import moment from "moment";

const ExotelCallsList = () => {
  const [callList, setCallList] = useState([]);
  const [loading, setLoading] = useState(false);
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
      if (data?.success && Array.isArray(data.data)) {
        setCallList(data.data);
        setPagination({
          currentPage: data?.pagination?.currentPage || page,
          totalPages: data?.pagination?.totalPages || Math.ceil((data?.pagination?.totalItems || data.data.length) / pagination.itemsPerPage),
          totalItems: data?.pagination?.totalItems || data.data.length,
          itemsPerPage: data?.pagination?.itemsPerPage || pagination.itemsPerPage,
        });
      } else {
        setCallList([]);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
        }));
      }
    } catch (error) {
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

const formatDuration = (seconds) => {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds} sec`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} mins ${secs} sec`;
};

  const getStatusLabel = (CallType, Direction) => {
    if (CallType === 'completed') return 'Call was successful';
    if (CallType === 'incomplete') return 'No user answered';
    if (CallType === 'client-hangup') return 'Client hung-up during call';
    if (CallType === 'busy') {
      if (Direction === 'incoming') return 'Dropped before connect';
      if (Direction === 'outcoming') return 'Dropped during call';
    }
    return CallType || '-';
  };

  const getStatusColor = (CallType) => {
    if (CallType === 'completed') return 'bg-green-600 text-white';
    if (CallType === 'client-hangup') return 'bg-red-600 text-white';
    if (CallType === 'busy') return 'bg-yellow-600 text-white';
    return 'bg-blue-600 text-white';
  };

  const getDirectionColor = (Direction) => {
    if (Direction === 'incoming') return 'text-orange-500';
    if (Direction === 'outcoming') return 'text-green-500';
    return 'text-blue-600';
  };

  return (
    <div className="mb-8 flex flex-col gap-12">
      <div className="p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Typography variant="small" className="text-gray-600 font-semibold">
            Filter by Date
          </Typography>
                <div className="flex items-center gap-2">
                  <Typography variant="small" className="text-gray w-auto font-semibold">
                    From:
                  </Typography>
                  <input
                    type="datetime-local"
                    value={startTimeFrom}
                    onChange={(e) => setStartTimeFrom(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm flex-1"
                  />
                  <Typography variant="small" className="text-gray w-auto font-semibold">
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
          {startTimeFrom && startTimeTo && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                </div>
              )}
        </div>
      </div>
      <Card>
        {callList.length > 0 ? (
          <>
            <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex justify-between items-center">
              <Typography variant="h6" color="white">Call Logs</Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    {[
                    "Start Time",
                    "End Time",
                    "From",
                    "To",
                    "Status",
                    "Calls Duration",
                    "Direction",
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
                      ({
                        id,
                        To,
                        From,
                        CallFrom,
                        CallTo,
                        CallType,
                        StartTime,
                        DialCallDuration,
                        Direction,
                        CurrentTime,
                        DialWhomNumber
                      }) => (
                        <tr key={id}>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{StartTime ? moment(StartTime).subtract(5, 'hours').subtract(30, 'minutes').format('DD-MM-YYYY HH:mm') : '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{CurrentTime ? moment(CurrentTime).subtract(5, 'hours').subtract(30, 'minutes').format('DD-MM-YYYY HH:mm') : '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{From || CallFrom || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{DialWhomNumber || '-'}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Chip
                              variant="ghost"
                              value={getStatusLabel(CallType, Direction)}
                              className={`py-0.5 px-2 text-[11px] font-medium w-fit ${getStatusColor(CallType)}`}
                            />
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className="text-xs font-semibold text-blue-gray-600">{formatDuration(DialCallDuration)}</Typography>
                          </td>
                          <td className="py-3 px-5 border-b border-blue-gray-50">
                            <Typography className={`text-xs font-semibold ${getDirectionColor(Direction)}`}>{Direction || '-'}</Typography>
                          </td>
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