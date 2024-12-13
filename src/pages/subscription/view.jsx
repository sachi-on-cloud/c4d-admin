import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from "react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
} from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';

export function SubscriptionView() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await ApiRequestUtils.get(API_ROUTES.GET_SUBSCRIPTION_LIST);
                console.log("Fetched Subscription Data:", data.result);

                if (data?.result) {
                    setAccounts(data.result);
                    setAllAccounts(data.result);
                }
            } catch (error) {
                console.error("Error fetching subscription data:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        getDetails(searchQuery.trim());
    }, [searchQuery]);

    const getDetails = (searchQuery) => {
        if (searchQuery && searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
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

    function formatDate(isoDateString) {
        const date = new Date(isoDateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return (
        <div className="mt-6 mb-8 flex flex-col gap-12">
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="relative flex-grow max-w-[500px]">
                        <input
                            type="text"
                            className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search Subscription"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/subscription/add')}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Add new
                    </button>
                </div>
            </div>
            <Card>
                {accounts.length > 0 ? (
                    <>
                        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex-1 justify-between items-center">
                            <Typography variant="h6" color="white">
                                Subscription List
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {["Name", "Mobile Number", "Type", "Cab Details", "Amount", "Start Date", "End Date"].map((el) => (
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
                                    {accounts.map((account, index) => (
                                        <tr key={index} className="text-sm">
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{account.Driver?.firstName || account.Cab?.Account?.name }</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{account.Driver?.phoneNumber || account.Cab?.Account?.phoneNumber }</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{account.Driver?.firstName ? "Driver" : account.Cab?.name ? "Owner": " "}</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{account.Cab?.name || account.Driver?.firstName }</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">1000</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{formatDate(account.startDate)}</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{formatDate(account.endDate)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>
                    </>
                ) : (
                    <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                        <Typography variant="h6" color="white">
                            No Subscriptions
                        </Typography>
                    </CardHeader>
                )}
            </Card>
        </div>
    );
}
