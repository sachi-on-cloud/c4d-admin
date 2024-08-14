// src/components/SearchableDropdown.js
import React, { useEffect, useState } from 'react';

const SearchableDropdown = ({ options, onSelect }) => {
    const [searchText, setSearchText] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState();

    useEffect(() => {
        setFilteredOptions(options);
    }, [options])
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(e.target.value);
        const isNumeric = /^\d+$/.test(value);

        // Form a regex pattern based on the input
        const pattern = isNumeric ? `^\\+91${value}` : value;

        // Create a regex for filtering
        const regex = new RegExp(pattern, 'i'); // 'i' for case-insensitive

        // Filter options based on input type
        const newFilteredOptions = options.filter((option) => {
            if (isNumeric) {
                return regex.test(option.phoneNumber);
            } else {
                return regex.test(option.firstName);
            }
        });
        setFilteredOptions(newFilteredOptions);
    }

    const handleOptionClick = (option) => {
        setSearchText(`${option.firstName} - ${option.phoneNumber}`); // Update the input with the selected option's details
        onSelect(option); // Notify the parent component of the selection
        setIsOpen(false); // Close the dropdown menu
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={searchText}
                onChange={handleSearchChange}
                onClick={() => setIsOpen(!isOpen)}
                placeholder="Search..."
                className="p-2 border rounded w-full"
            />
            {isOpen && (
                <div className="absolute z-10 overflow-x-auto w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.id} // Assuming each option has a unique 'id'
                                onClick={() => handleOptionClick(option)}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                            >
                                {option.firstName} - {option.phoneNumber}
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-gray-500">No options found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
