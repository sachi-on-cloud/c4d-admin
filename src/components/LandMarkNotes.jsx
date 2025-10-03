import React, { useState, useEffect } from 'react';

const LandMarkBookingNotes = ({ addNotes, landmark }) => {
  const [text, setText] = useState('');
  const [hasLandmark, setHasLandmark] = useState(false);

  useEffect(() => {
    // Check if there's already a landmark note
    setHasLandmark(!!landmark);
  }, [landmark]);

  const handleAddItem = async () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    const newItem = {
      notes: text.trim(),
      landmark: text.trim(),
    };

    try {
      addNotes(newItem);
      setText('');
      setHasLandmark(true); // Hide the input after adding
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="flex-1 p-4 bg-gray-100">
      <div>
        <p className="text-gray-500 text-lg mb-2">LandMark Notes</p>
      </div>
      
      {/* Conditionally render the input area only if there's no landmark */}
      {!hasLandmark && (
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
            Add LandMark
          </button>
        </div>
      )}

      <div className="flex-1">
        {landmark && (
          <p className="text-base font-bold text-gray-700">{landmark}</p>
        )}
      </div>
    </div>
  );
};

export default LandMarkBookingNotes;