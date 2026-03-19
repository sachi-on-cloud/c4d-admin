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
    Checkbox,
    Button,
    Spinner,
} from "@material-tailwind/react";
import { Link, useNavigate } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import moment from 'moment';

export function InvoiceList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [invoiceList, setInvoiceList] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);
    const [invoiceTypeFilter, setInvoiceTypeFilter] = useState(['All']);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState(['All']);
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 15,
         search: searchQuery.trim(),
        //   forSearch:false
    });

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const fetchInvoices = async (page = 1, showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_INVOICE_LIST, {
                page: page,
                limit: pagination.itemsPerPage,
                search: searchQuery.trim()
            });

            if (data) {
                setInvoiceList(data?.data || []);
                setAllAccounts(data?.data || []);
                setPagination((prev) => ({
                    ...prev,
                    currentPage: page,
                    totalPages: data?.pagination?.totalPages || 1,
                    totalItems: data?.pagination?.totalItems || 0,
                    itemsPerPage: data?.pagination?.itemsPerPage || 15,
                    search: searchQuery.trim()
                }));
            }
        } catch (error) {
            console.error("Error fetching invoice data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getInvoices = debounce(() => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        fetchInvoices(1, true);
    }, 1000);

    useEffect(() => {
        fetchInvoices(pagination.currentPage,pagination.search, true);
    }, [pagination.currentPage]);
    

    useEffect(() => {
        getInvoices();
    }, [searchQuery]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, currentPage: page }));
            fetchInvoices(page, pagination.search, true)
        }
    };

    const generatePageButtons = () => {
        const buttons = [];
        const maxVisible = 5;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    size="sm"
                    variant={i === pagination.currentPage ? 'filled' : 'outlined'}
                    className={`mx-1 ${ColorStyles.bgColor} text-white`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Button>
            );
        }

        return buttons;
    };

    const handleFilterChange = (filterType, value) => {
        const updateFilter = (prev) => {
            if (value === 'All') return ['All'];
            const updated = prev.includes(value)
                ? prev.filter(item => item !== value)
                : [...prev.filter(item => item !== 'All'), value];
            return updated.length === 0 ? ['All'] : updated;
        };

        if (filterType === 'status') {
            setPaymentStatusFilter(updateFilter);
        } else if (filterType === 'Subscription') {
            setInvoiceTypeFilter(updateFilter);
        }
    };

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
                            className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Search Invoice Number"
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
                        <CardHeader variant="gradient" className={`mb-8 p-6 flex-1 justify-between items-center ${ColorStyles.bgColor}`}>
                            <Typography variant="h6" color="white">
                                Invoice List
                            </Typography>
                        </CardHeader>
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {["Invoice Number", "Created Date", "Invoice Type", "Amount", "Status"].map((el) => (
                                            <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
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
                                                            { value: "All", label: "All" },
                                                            { value: "Free Plan", label: "Free Plan" },
                                                            { value: "Basic Plan", label: "Basic Plan" },
                                                            { value: "Standard Plan", label: "Standard Plan" },
                                                            { value: "Premium Plan", label: "Premium Plan" }
                                                        ]}
                                                        selectedFilters={invoiceTypeFilter}
                                                        onFilterChange={(value) => handleFilterChange("Subscription", value)}
                                                    />
                                                ) : (
                                                    <Typography variant="small" className="text-[11px] font-bold uppercase text-black">
                                                        {el}
                                                    </Typography>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                              <td colSpan={6} className="py-3 px-3">
                                                                   <div className="flex justify-center items-center">
                                                                     <Spinner className="h-12 w-12" />
                                                                   </div>
                                                                 </td>
                                        </tr>
                                    ) : (
                                        invoiceList
                                            .filter((invoice) =>
                                                (paymentStatusFilter.includes('All') || paymentStatusFilter.includes(invoice.status)) &&
                                                (invoiceTypeFilter.includes('All') || invoiceTypeFilter.includes(invoice?.Subscription?.Plan?.name))
                                            )
                                            .map((invoice, index) => (
                                                <tr key={index} className="text-sm">
                                                    <td className='border-b border-blue-gray-50 py-3 px-5'>
                                                        <Link
                                                            to={`/dashboard/finance/invoice/details/${invoice?.invoiceNumber}`}
                                                            className="font-semibold underline cursor-pointer text-primary-600"
                                                        >
                                                            {invoice?.invoiceNumber}
                                                        </Link>
                                                    </td>
                                                    <td className="border-b border-blue-gray-50 text-black py-3 px-5">{moment(invoice?.created_at).format('DD-MM-YYYY')}</td>
                                                    <td className="border-b border-blue-gray-50 text-black py-3 px-5">{invoice?.Subscription?.Plan?.name}</td>
                                                    <td className="border-b border-blue-gray-50 text-black py-3 px-5">{invoice?.amount}</td>
                                                    <td className="border-b border-blue-gray-50 text-black py-3 px-5">{invoice?.status}</td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>

                        
                            <div className="flex items-center justify-center mt-4">
                                <Button
                                    size="sm"
                                    variant="text"
                                    disabled={pagination.currentPage === 1}
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    className="mx-1"
                                >
                                    {'<'}
                                </Button>
                                {generatePageButtons()}
                                <Button
                                    size="sm"
                                    variant="text"
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    className="mx-1"
                                >
                                    {'>'}
                                </Button>
                            </div>
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

export default InvoiceList;
