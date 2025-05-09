import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from "react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Popover,
    PopoverHandler,
    PopoverContent,
    Checkbox
} from "@material-tailwind/react";
import { useNavigate } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';

export function InvoiceList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [invoiceList, setInvoiceList] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);
    const [invoiceTypeFilter, setInvoiceTypeFilter]= useState(['All']);
    const [paymentStatusFilter, setPaymentStatusFilter]= useState(['All']);  

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await ApiRequestUtils.get(API_ROUTES.GET_INVOICE_LIST);
                // Sorting needs to be done after api implementation             
                if (data) {
                    setInvoiceList(data?.data);
                    setAllAccounts(data?.data);
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
                const number = acc.invoiceNumber.toLowerCase();
                return (
                    number.includes(query)
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
const handleFilterChange = (filterType,value) => {
    if(filterType === 'status')
    {
        setPaymentStatusFilter(prev => {
            if(value === 'All')
            {
                return['All']
            }
            else {
                const newFilter = prev.includes(value) ?
                prev.filter(item => item !== value) :
                [...prev.filter(item => item !== 'All'), value];
                return newFilter.length === 0 ? ['All'] : newFilter;
            }
        })
    }
    else if(filterType === "Subscription")
    {
        setInvoiceTypeFilter(prev => {
            if(value === 'All')
            {
                return['All']
            }
            else {
                const newFilter = prev.includes(value) ?
                prev.filter(item => item !== value) :
                [...prev.filter(item => item !== 'All') , value];
                return newFilter.length === 0 ? ['All'] : newFilter
            }
        })

    }
}
const FilterPopover = ({ title, options, selectedFilters, onFilterChange }) => (
    <Popover placement="bottom-start">
      <PopoverHandler>
        <div className="flex items-center cursor-pointer">
          <Typography variant="small" className={`text-[11px] font-bold uppercase mr-1 ${ColorStyles.PopoverHandlerText}`}>
            {title}
          </Typography>
          <FaFilter className="text-black text-xs" />
        </div>
      </PopoverHandler>
      <PopoverContent className="p-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center mb-2">
            <Checkbox
              color="blue"
              checked={selectedFilters.includes(option.value)}
              onChange={() => onFilterChange(option.value)}
            />
            <Typography color="blue-gray" className="font-medium ml-2">
              {option.label}
            </Typography>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
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
                </div>
            </div>
            <Card>
                {invoiceList.length > 0 ? (
                    <>
                        <CardHeader variant="gradient"  className={`mb-8 p-6 flex-1 justify-between items-center ${
                            ColorStyles.bgColor
                        }`}>
                            <Typography variant="h6" color="white">
                               Invoice List
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {["Invoice Number","Created Date","Invoice Type","Amount","Status"].map((el) => (
                                            <th
                                                key={el}
                                                className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                            >
                                                {el === "Status" ? (
                                                    <FilterPopover
                                                        title={el}
                                                        options={[
                                                            { value: "All", label: "All" },
                                                            { value: "PAYMENT_COMPLETED", label: "Payment Completed" },
                                                            { value: "PAYMENT_PENDING", label: "Payment Pending" },
                                                            { value: "PAYMENT_CANCELLED", label: "Payment Cancelled" }
                                                        ]}
                                                        selectedFilters={paymentStatusFilter}
                                                        onFilterChange={(value) => handleFilterChange("status", value)}
                                                    />
                                                ) : el === "Invoice Type" ? (
                                                    <FilterPopover 
                                                    title={el}
                                                    options={[
                                                        { value: 'All' , label: 'All'},
                                                        { value: "Free Plan",label:"Free Plan" },
                                                        { value: "Basic Plan",label:"Basic Plan" },
                                                        { value: "Standard Plan",label:"Standard Plan" },
                                                        { value: "Premium Plan",label:"Premium Plan" }
                                                    ]}
                                                    selectedFilters={invoiceTypeFilter}
                                                    onFilterChange={(value) => handleFilterChange("Subscription",value) }
                                                    />
                                                ) : (
                                                    <Typography
                                                        variant="small"
                                                        className="text-[11px] font-bold uppercase text-black"
                                                    >
                                                        {el}
                                                    </Typography>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceList.filter(invoiceList => 
                                        (paymentStatusFilter.includes('All') || paymentStatusFilter.includes(invoiceList.status)) &&
                                        (invoiceTypeFilter.includes('All') || invoiceTypeFilter.includes(invoiceList?.Subscription?.Plan?.name))
                                    )
                                    .map((invoice,index) => (
                                        <tr key={index} className="text-sm">
                                            <td className='border-b border-blue-gray-50 py-3 px-5'>
                                                <div className="flex items-center gap-4">
                                                    <div onClick={() => navigate(`/dashboard/finance/invoice/details/${invoice?.invoiceNumber}`)}>
                                                        <Typography
                                                            variant="small"
                                                            color="blue"
                                                            className="font-semibold underline cursor-pointer"
                                                        >
                                                            {invoice?.invoiceNumber}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border-b border-blue-gray-50 text-black py-3 px-5">{formatDate(invoice?.created_at)}</td>
                                            <td className="border-b border-blue-gray-50 text-black py-3 px-5">{invoice?.Subscription?.Plan?.name}</td>
                                            <td className="border-b border-blue-gray-50 text-black py-3 px-5">{invoice?.amount}</td>
                                            <td className="border-b border-blue-gray-50 text-black py-3 px-5">{invoice?.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>
                    </>
                ) : (
                    <CardHeader variant="gradient" className={`mb-8 p-6 ${ColorStyles.bgColor}`}>
                        <Typography variant="h6" color="white">
                            No Invoices
                        </Typography>
                    </CardHeader>
                )}
            </Card>
        </div>
    );
}
