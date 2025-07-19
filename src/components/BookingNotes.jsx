import React, { useState, useEffect } from 'react';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import moment from "moment";

const TextBoxWithList = ({addNotes, notesData}) => {
  const [text, setText] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(notesData || []);
  }, []);

  const handleAddItem = async () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    const newItem = {
        notes: text.trim(),
    };

    try {
        addNotes(newItem)
        setText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="flex-1 p-4 bg-gray-100">
        <div>
            <p className=" text-gray-500 text-lg mb-2">Notes</p>
        </div>
      <div className="mb-4">
        <textarea
          className="border border-gray-200 rounded-lg p-3 mb-2 bg-white text-base min-h-[60px] w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleAddItem}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    {item?.User?.name || 'Unknown User'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {moment(item?.created_at).format('DD-MM-YYYY / hh:mm A')}
                  </span>
                </div>
                <p className="text-base text-gray-700">{item?.notes}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TextBoxWithList;