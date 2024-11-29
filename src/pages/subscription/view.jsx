import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState,useEffect } from "react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Alert
  } from "@material-tailwind/react";
  import { useNavigate } from 'react-router-dom';


export function SubscriptionView(){
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);

    useEffect(()=>{
        const fetchData = async ()=> {
            const data = await ApiRequestUtils.get(API_ROUTES.GET_SUBCRIPTION_PLAN);
            console.log("SUBBBDATAAAAA",data)
            // if(data?.success){
            //     setAccounts(data?.document);
            //     setAllAccounts(data?.document);
            // }
        }
        fetchData();
    },[])

    useEffect(() => {
        getDeatils(searchQuery.trim());
      }, [searchQuery]);

    const getDeatils = async (searchQuery) => {
        if (searchQuery && searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase().trim();
            const filteredAccounts = allAccounts.filter((acc) => {
            const name = (acc.firstName || "").toLowerCase();
            const phone = (acc.phoneNumber || "").toLowerCase();
            const phoneNumberWithoutCountryCode = phone.startsWith("+91") ? phone.slice(3) : phone;
            return (
                name.startsWith(query) || 
                phone.startsWith(query) || 
                phoneNumberWithoutCountryCode.startsWith(query)
            );
          });
          setAccounts(filteredAccounts);
        } else {
          setAccounts(allAccounts);
        }
    };

    return (
        <div className="mt-6 mb-8 flex flex-col gap-12">
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="relative flex-grow max-w-[500px]">
                    <input
                        type="text"
                        className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Search Account"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    </div>
                    <button 
                    onClick={()=> navigate('/dashboard/subscription/add')}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                    Add new
                    </button>
                </div>
            </div>
            {/* {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="relative bg-white rounded-md shadow-lg p-6 w-96">
                <button
                    onClick={handleModalClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    X
                </button>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Type</h3>
                <div className="flex flex-col gap-4">
                    <button
                    onClick={() => handleOptionSelect("owner")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
                    >
                    Owner
                    </button>
                    <button
                    onClick={() => handleOptionSelect("driver")}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
                    >
                    Driver
                    </button>
                </div>
                </div>
            </div>
            )} */}
            <Card>
                { true ? ( // accounts.length > 0 
                <>
                    <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex-1 justify-between items-center">
                    <Typography variant="h6" color="white">
                        Accounts List
                    </Typography>
                    </CardHeader>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                            {["Name","Mobile Number","Type","Cab Details","Amount","Start Date","End Date"].map((el) => (
                                <th
                                key={el}
                                className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                >
                                <Typography
                                    variant="small"
                                    className="text-[11px] font-bold uppercase text-blue-gray-400"
                                >
                                    {el}
                                </Typography>
                                </th>
                            ))}
                            </tr>
                        </thead>
                        <tbody>
                            
                        </tbody>
                        </table>
                    </CardBody>
                </>) : (
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                    <Typography variant="h6" color="white">
                    No Accounts
                    </Typography>
                </CardHeader>
                )}
            </Card>
        </div>
    )
}