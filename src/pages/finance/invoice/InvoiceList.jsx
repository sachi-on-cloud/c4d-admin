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

export function InvoiceList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [invoiceList, setInvoiceList] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // const data = await ApiRequestUtils.get(API_ROUTES.GET_MASTER_SUBSCRIPTION_LIST);
                // Sorting needs to be done after api implementation
                const data = [
                    {
                      "invoiceNumber": "INV-20240201-001",
                      "invoiceType": "Subscription",
                      "invoiceCreatedDate": "2024-02-01",
                      "package": "Premium Driver Package",
                      "driverName": {
                        "value": "John Doe",
                        "link": "/drivers/DR001"
                      },
                      "driverPhoneNumber": "+91 9876543210",
                      "status": "Pending Payment",
                      "paymentMethod": "Online",
                      "amount": "₹2500"
                    },
                    {
                      "invoiceNumber": "INV-20240201-002",
                      "invoiceType": "Subscription",
                      "invoiceCreatedDate": "2024-02-02",
                      "package": "Basic Driver Package",
                      "driverName": {
                        "value": "Jane Smith",
                        "link": "/drivers/DR002"
                      },
                      "driverPhoneNumber": "+91 9876543211",
                      "status": "Pending Payment",
                      "paymentMethod": "Online",
                      "amount": "₹1500"
                    }
                ];                  

                if (data) {
                    setInvoiceList(data);
                    setAllAccounts(data);
                }
            } catch (error) {
                console.error("Error fetching subscription data:", error);
            }
        };
        fetchData();
    }, []);

    // useEffect(() => {
    //     getDetails(searchQuery.trim());
    // }, [searchQuery]);

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
            setInvoiceList(filteredAccounts);
        } else {
            setInvoiceList(allAccounts);
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
                            className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search Subscription"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
            <Card>
                {invoiceList.length > 0 ? (
                    <>
                        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex-1 justify-between items-center">
                            <Typography variant="h6" color="white">
                               Invoice List
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {["Invoice Number","Created Date","Invoice Type F","Amount","Status F"].map((el) => (
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
                                    {invoiceList.map((invoice,index) => (
                                        <tr key={index} className="text-sm">
                                            <td className='border-b border-blue-gray-50 py-3 px-5'>
                                            <div className="flex items-center gap-4">
                                                <div onClick={() => navigate(`/dashboard/finance/invoice/details/${1}`)}>
                                                <Typography
                                                    variant="small"
                                                    color="blue"
                                                    className="font-semibold underline"
                                                >
                                                    {invoice.invoiceNumber}
                                                </Typography>
                                                </div>
                                            </div>
                                            </td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{invoice.invoiceCreatedDate}</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{invoice.invoiceType}</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{invoice.driverName.value}</td>
                                            <td className="border-b border-blue-gray-50 py-3 px-5">{invoice.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>
                    </>
                ) : (
                    <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                        <Typography variant="h6" color="white">
                            No Invoices
                        </Typography>
                    </CardHeader>
                )}
            </Card>
        </div>
    );
}
