// src/components/SearchableDropdown.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchableDropdown = ({ searchVal, addVal, selected, options, onSelect }) => {
    const [searchText, setSearchText] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState();
    const [selectedValue, setSelectedValue] = useState(selected);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    function findRecordById(records, field, id) {
        return records.find(record => record[field] == id);
    }

    useEffect(() => {
        setFilteredOptions(options);
        if (selectedValue) {
            let val = findRecordById(options, 'id', selectedValue);
            setSearchText(`${val.firstName} - ${val.phoneNumber}`);
            onSelect(val);
        } else if (addVal) {
            let val = findRecordById(options, 'phoneNumber', addVal);
            if (val) {
                setSearchText(`${val?.firstName} - ${val?.phoneNumber}`);
                onSelect(val);
            }
        }
    }, [options])
    const handleSearchChange = (e) => {
        onSelect("");
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
                searchVal(value);
                return regex.test(option.phoneNumber);
            } else {
                searchVal('');
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
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div className="w-full" ref={dropdownRef} onClick={() => setIsOpen(!isOpen)}>
            <input
                type="text"
                value={searchText}
                onChange={handleSearchChange}
                onClick={() => setIsOpen(!isOpen)}
                placeholder="Search customers"
                className="p-2 border rounded-xl w-full"
                readOnly={selectedValue}
                disabled={selectedValue}
            />
            {isOpen && (
                <div className="absolute z-10 max-w-max max-h-64 mt-1 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg">
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
                        <>
                            <div className="p-2 text-gray-500">No options found</div>
                            {/* <div className="p-2 text-blue-700" onClick={() => {
                                navigate('/dashboard/customers/add');
                            }}>+ Add new customer</div> */}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
