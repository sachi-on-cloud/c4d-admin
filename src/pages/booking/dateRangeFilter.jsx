import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns';

const DateRangeFilter = ({ onFilterChange }) => {
  const [filterOption, setFilterOption] = useState('Today');
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;

  // Handle filter option change
  const handleFilterChange = (option) => {
    setFilterOption(option);
    let start, end;

    if (option === 'Today') {
      start = startOfDay(new Date());
      end = endOfDay(new Date());
    } else if (option === 'This Week') {
      start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday as week start
      end = endOfWeek(new Date(), { weekStartsOn: 1 });
    } else {
      start = startDate || new Date();
      end = endDate || new Date();
    }
    setDateRange([start, end]);
    console.log(onFilterChange({ startDate: start, endDate: end }));
  };

  // Handle custom date range change
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setDateRange([start, end]);
    if (start && end) {
      console.log(onFilterChange({ startDate: start, endDate: end }));
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Filter
        </label>
        <select
          value={filterOption}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="Range">Custom Range</option>
        </select>
      </div>

      {filterOption === 'Range' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date Range
          </label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateRangeChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            dateFormat="MMMM d, yyyy"
          />
        </div>
      )}

      <div className="text-sm text-gray-600">
        Selected Range:{' '}
        {startDate && endDate
          ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
          : 'No range selected'}
      </div>
    </div>
  );
};

export default DateRangeFilter;