import React, { useState, useEffect } from 'react';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import { UserIcon } from '@heroicons/react/24/solid';
import moment from "moment";
import { Typography } from '@material-tailwind/react';

const TextBoxWithList = ({addNotes, notesData, bookingId }) => {
  const [text, setText] = useState('');
  const [noteType, setNoteType] = useState('')
  const [items, setItems] = useState([]);
  const [bookingLogs, setBookingLogs] = useState([]);
    const [quotationLogs, setQuotationLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState(''); 

  useEffect(() => {
    const fetchNotes = async () => {
      const fallbackNotes = Array.isArray(notesData) ? notesData : [];

      if (!bookingId) {
        console.warn('No bookingId provided, falling back to notesData');
        setItems(fallbackNotes);
        setBookingLogs([]);
        setQuotationLogs([]);
        return;
      }

      try {
        // console.log('bookingId:', bookingId);
        const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_NOTES_BOOKING, { bookingId });
        // console.log('API response:', data);
        if (data?.success) {
          // Set notes, ensuring it's an array
          setItems(Array.isArray(data?.data?.notes) ? data.data.notes : []);
          // Set bookingLogs, ensuring it's an array
          setBookingLogs(Array.isArray(data?.data?.bookingLog) ? data.data.bookingLog : []);
          setQuotationLogs(Array.isArray(data?.data?.quotationLog) ? data?.data?.quotationLog : []);
        } else {
          console.warn('API call failed, falling back to notesData:', data?.message);
          setItems(fallbackNotes);
          setBookingLogs([]);
          setQuotationLogs([]);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        setItems(fallbackNotes);
        setBookingLogs([]);
        setQuotationLogs([]);
      }
    };

    fetchNotes();
  }, [bookingId, notesData]);

  const handleAddItem = async () => {
    setErrorMessage(''); 
    if (!noteType) {
      setErrorMessage('Please select a note type first');
      return;
    }

    if (!text.trim()) {
      setErrorMessage('Please enter some text');
      return;
    }

    const newItem = {
      notes: text.trim(),
      bookingId: bookingId,
      noteType: noteType,
    };

    try {
      addNotes(newItem)
      setText('');
      setNoteType(''); 
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_NOTES_BOOKING, { bookingId });
      // console.log('API response after adding note:', data);
      if (data?.success) {
        // Set notes, ensuring it's an array
        setItems(Array.isArray(data?.data?.notes) ? data.data.notes : []);
        // Set bookingLogs, ensuring it's an array
        setBookingLogs(Array.isArray(data?.data?.bookingLog) ? data.data.bookingLog : []);
        setQuotationLogs(Array.isArray(data?.data?.quotationLog) ? data?.data?.quotationLog : []);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="flex-1 p-4 bg-gray-100">
      <div>
        <Typography className="text-xl font-semibold text-blue-gray-600">Notes</Typography>
      </div>
      <div className='pt-2'>
        <label htmlFor="noteType" className="text-sm font-medium text-gray-700">
         Please select a Notes Type
        </label>
        <select
          id="noteType"
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          className="p-2 w-full rounded-md border bg-white border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
        >
          <option value="">Select Note Type</option>
          <option value="ENQUIRY">Enquiry</option>
          <option value="TRIP">Trip</option>
          <option value="PAYMENT">Payment</option>
          <option value="FEEDBACK">Feedback</option>
        </select>
      </div>
      <div className="mb-4 pt-2">
        <textarea
          className="border border-gray-200 rounded-lg p-3 mb-2 bg-white text-base min-h-[60px] w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
        <button
          onClick={handleAddItem}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Add Note
        </button>
      </div>

      <div className="flex-1">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 text-base mt-5">No items yet.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item?.id}
                className="bg-white rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">
                    {item?.User?.name || 'Unknown User'}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">
                    {moment(item?.created_at).format('DD-MM-YYYY / hh:mm A')}
                  </span>
                </div>
                <p className="text-base text-gray-700">Note Type: 
                  <span className='text-primary-600'>
                      {item?.noteType || 'N/A'}
                  </span>
                  </p>
                <p className="text-base text-gray-700">{item?.notes}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className='py-5'>
        <Typography className="text-xl font-semibold text-blue-gray-600">
          Check Estimate Price Log
        </Typography>
      </div>
      <div className="flex-1 mb-5">
        <ul className="space-y-3">
          {quotationLogs.length === 0 ? (
            <p className="text-center text-gray-500 text-base mt-5">No estimate logs yet.</p>
          ) : (
            quotationLogs.map((log) => (
              <li
                key={log.id}
                className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">
                    {log?.User?.name || 'System'}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">
                    {moment(log?.created_at).format('DD-MM-YYYY / hh:mm A')}
                  </span>
                </div>
              <div className="text-base text-gray-700 flex items-center gap-2">
  <span>
    <span className="font-bold">Estimate Price:</span> ₹{log?.amount} | <span className="font-bold">Pickup:</span> {log?.pickupAddress?.name || 'N/A'} | <span className="font-bold">Drop:</span> {log?.dropAddress?.name || 'N/A'}
    {/* {log?.packageId && ` | <span className="font-bold">Package ID:</span> ${log?.packageId}`} */}
  </span>
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    Estimated
  </span>
</div>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className='py-5'>
        <Typography className="text-xl font-semibold text-blue-gray-600">
          Booking Status Log
        </Typography>
      </div>
      <div className="flex-1">
        {bookingLogs.length === 0 ? (
          <p className="text-center text-gray-500 text-base mt-5">No activity logs yet.</p>
        ) : (
          <ul className="space-y-3">
            {bookingLogs.map((log) => (
              <li
                key={log?.id}
                className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">
                    {log?.createdBy?.name || 'System'}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">
                    {moment(log?.created_at).format('DD-MM-YYYY / hh:mm A')}
                  </span>
                </div>
                <div className="text-base text-gray-700 flex items-center gap-2">
                  <span>
                    Customer Trip Status changed from{' '}
                    <span className="font-medium text-primary-600">{log?.old_status || 'N/A'}</span>{' '}
                    to{' '}
                    <span className="font-medium text-green-600">{log?.new_status || 'N/A'}</span>
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      log?.new_status === 'Confirmed'
                        ? 'bg-green-100 text-green-800'
                        : log?.new_status === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {/* {log?.new_status || 'N/A'} */}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TextBoxWithList;