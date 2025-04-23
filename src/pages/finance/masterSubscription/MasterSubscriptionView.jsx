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

export function MasterSubscriptionView() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [masterSubscriptionList, setMasterSubscriptionList] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await ApiRequestUtils.get(API_ROUTES.GET_MASTER_SUBSCRIPTION_LIST);
                
                if (data?.result) {
                    setMasterSubscriptionList(data.result);
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
                const name = (acc?.Cab?.Account?.name || "").toLowerCase();
                const phone = (acc?.Cab?.Account?.phoneNumber || "").toLowerCase();
                const phoneNumberWithoutCountryCode = phone.startsWith("+91") ? phone.slice(3) : phone;

                return (
                    name.startsWith(query) ||
                    phone.startsWith(query) ||
                    phoneNumberWithoutCountryCode.startsWith(query)
                );
            });
            setMasterSubscriptionList(filteredAccounts);
        } else {
            setMasterSubscriptionList(allAccounts);
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
        <div className="mb-8 flex flex-col gap-12">
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="relative flex-grow max-w-[500px]">
                        <input
                            type="text"
                            className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search Subscription"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/finance/master-subscription/add')}
                        className="ml-4 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Add new
                    </button>
                </div>
            </div>
            <Card>
                {masterSubscriptionList.length > 0 ? (
                    <>
                        <CardHeader variant="gradient"  className="mb-8 p-6 flex-1 justify-between items-center bg-blue-gray-100">
                            <Typography variant="h6" color="black">
                               Master Subscription List
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {["Service Type", "Price","Name","Base Credits","Bonus Credits","Total Credits","Type","Validity (Months)"].map((el) => (
                                            <th
                                                key={el}
                                                className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                            >
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
                                    {masterSubscriptionList.map((masterSubscription, index) => (
                                        <tr key={index} className="text-sm">
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{masterSubscription.serviceType === "DRIVER" ? (<div>Acting Driver</div>): masterSubscription.serviceType || 
                                            masterSubscription.serviceType === 'RIDES_RENTAL_CABS' ? (<div>Rides/Rental Cabs</div>) : masterSubscription.serviceType}</td>
                                            <td className='border-b border-blue-gray-50 py-3 px-5'>
                                                <div onClick={() => navigate(`/dashboard/finance/master-subscription/details/${masterSubscription.id}`)}>
                                                    <Typography
                                                        variant="small"
                                                        color="blue"
                                                        className="font-semibold underline cursor-pointer"
                                                    >
                                                        {masterSubscription.packagePrice == 0 ? 'Free' : masterSubscription.packagePrice}
                                                    </Typography>

                                                </div>
                                            </td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{masterSubscription.name ? masterSubscription.name : '-'}</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{masterSubscription.price == 0 ? 'Free' : masterSubscription.price}</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{masterSubscription.bonusPrice ? masterSubscription.bonusPrice : '-'}</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{masterSubscription.totalPrice ? masterSubscription.totalPrice : '-'}</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{masterSubscription.type ? masterSubscription.type : '-'}</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{masterSubscription.validityDays ? masterSubscription.validityDays : '-'}</td>

                                            {/* <td className="border-b border-blue-gray-50 py-3 px-5">{formatDate(masterSubscription.discountEndDate)}</td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>
                    </>
                ) : (
                    <CardHeader variant="gradient"  className="mb-8 p-6 bg-blue-gray-100">
                        <Typography variant="h6" color="black">
                            No Master Subscriptions
                        </Typography>
                    </CardHeader>
                )}
            </Card>
        </div>
    );
}
