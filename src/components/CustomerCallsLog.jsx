import React, { useEffect, useState } from 'react';
import { Card, CardBody, Typography, Chip } from "@material-tailwind/react";
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import moment from 'moment';

const CustomerCallsLog = ({ customerId }) => {
  const [callsLog, setCallsLog] = useState([]);

  const fetchLog = async () => {
    if (!customerId) {
      setCallsLog([]);
      return;
    }

    try {
      const data = await ApiRequestUtils.get(`${API_ROUTES.GET_CUSTOMER}/${customerId}`);
      if (data?.success && Array.isArray(data.callLogs)) {
        setCallsLog(data.callLogs);
      } else {
        setCallsLog([]);
      }
    } catch (error) {
      setCallsLog([]);
    }
  };

  useEffect(() => {
    fetchLog();
  }, [customerId]);

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
    <div className="px-2 mb-2 mt-4">
      <h2 className="text-2xl font-bold mb-4">Call Log</h2>
      <Card>
        {callsLog.length > 0 ? (
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
                {callsLog.map(
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
                    DialWhomNumber,
                  }) => (
                    <tr key={id}>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {StartTime ? moment(StartTime).subtract(5, 'hours').subtract(30, 'minutes').format('DD-MM-YYYY HH:mm') : '-'}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {CurrentTime ? moment(CurrentTime).subtract(5, 'hours').subtract(30, 'minutes').format('DD-MM-YYYY HH:mm') : '-'}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {From || CallFrom || '-'}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {DialWhomNumber || CallTo || To || '-'}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Chip
                          variant="ghost"
                          value={getStatusLabel(CallType, Direction)}
                          className={`py-0.5 px-2 text-[11px] font-medium w-fit ${getStatusColor(CallType)}`}
                        />
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {formatDuration(DialCallDuration)}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography className={`text-xs font-semibold ${getDirectionColor(Direction)}`}>
                          {Direction || '-'}
                        </Typography>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </CardBody>
        ) : (
          <CardBody className="py-6 text-center">
            <Typography variant="h6" className="text-blue-gray-600">
              No Call Records Available
            </Typography>
          </CardBody>
        )}
      </Card>
    </div>
  );
};

export default CustomerCallsLog;