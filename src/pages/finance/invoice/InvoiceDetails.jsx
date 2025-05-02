import React, { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';

const InvoiceDetails = () => {
    const [invoice, setInvoice] = useState({});
    const { invoiceNumber } = useParams();
    const navigate = useNavigate();
    const pdfRef = useRef();
    const [edit, setEdit] = useState(true);
    const [status,setStatus] = useState("");
    const [id, setId] = useState("");

    useEffect(() => {
        if (invoiceNumber) {
            fetchInvoice(invoiceNumber);
        }
    }, [invoiceNumber]);

    const fetchInvoice = async (invoiceNumber) => {
        try {
            const data = await ApiRequestUtils.get(`${API_ROUTES.GET_INVOICE_DETAILS}/${invoiceNumber}`);
            setStatus(data?.data?.status);
            setInvoice(data?.data);
            setId(data?.data.id);
            if(data?.data?.status == "PAYMENT_PENDING"){
                setEdit(true);
            }
        } catch (error) {
            console.error("Error fetching invoice details:", error);
        }
    };

    const handleDownloadPDF = () => {
        const input = pdfRef.current;
    
        html2canvas(input, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190; 
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
        });
    };
    

    const onEditPress = () =>{
        setEdit(false);
    };

    
    function formatDate(isoDateString) {
        const date = new Date(isoDateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const handleSave = async () => {    
        try {
            const response = await ApiRequestUtils.update(API_ROUTES.UPDATE_INVOICE_STATUS_DETAILS, {
                invoiceNumber: invoiceNumber.toString(),
                status: status,
                id: id,
            });
            if (response?.success) {
                setEdit(true);
                fetchInvoice(invoiceNumber);
            } else {
                console.error("Failed to update invoice status:", response?.message);
            }
        } catch (error) {
            console.error("Error updating invoice status:", error);
        }
    };
    

    return (
        <>
            <div className="p-4 mx-auto">
                <h2 className="text-2xl font-bold mb-4">Invoice Details</h2>
                <div ref={pdfRef}>
                    <Formik 
                        initialValues={{     
                            invoiceNumber: invoice?.invoiceNumber || '',
                            invoiceType: 'Subscription',
                            invoiceCreatedDate: formatDate(invoice?.created_at) || '',
                            package: invoice?.Subscription?.Plan?.name || '',
                            status: invoice?.status || '',
                            paymentMethod: invoice?.paymentMethod || '',
                            amount: invoice?.amount || '',
                            driverName: invoice?.Subscription?.Cab?.driver_name || '',
                            driverPhoneNumber : invoice?.Subscription?.Cab?.phone_number || '',
                            ownerName: invoice?.Subscription?.Cab?.Account?.name || '',
                            ownerPhoneNumber : invoice?.Subscription?.Cab?.Account?.phone_number || ''
                        }} 
                        enableReinitialize
                    >
                        {(values) => (
                            <Form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Invoice Number</label>
                                        <Field type="text" disabled name="invoiceNumber" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm" />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Invoice Type</label>
                                        <Field type="text" disabled name="invoiceType" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Created Date</label>
                                        <Field type="text" disabled name="invoiceCreatedDate" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Package</label>
                                        <Field type="text" disabled name="package" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    {true && <>
                                        <div className='space-y-1'>
                                            <label className="text-sm font-medium text-gray-700">Driver Name</label>
                                            <Field type="text" disabled name="driverName" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className="text-sm font-medium text-gray-700">Driver Phone Number</label>
                                            <Field type="text" disabled name="driverPhoneNumber" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                        </div>
                                    </>}
                                    {true && <>
                                        <div className='space-y-1'>
                                            <label className="text-sm font-medium text-gray-700">Owner Name</label>
                                            <Field type="text" disabled name="ownerName" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className="text-sm font-medium text-gray-700">Owner Phone Number</label>
                                            <Field type="text" disabled name="ownerPhoneNumber" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                        </div>
                                    </>}
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Status</label>
                                        <Field as="select" name="status" disabled={edit} className="p-2 h-[50px] w-full rounded-md border border-gray-300 bg-white"
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="PAYMENT_PENDING">Pending Payment</option>
                                            <option value="PAYMENT_COMPLETED">Payment Completed</option>
                                            <option value="PAYMENT_CANCELLED">Payment Cancelled</option>
                                        </Field>                                    
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Payment Method</label>
                                        <Field type="text" disabled name="paymentMethod" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Amount</label>
                                        <Field type="text" disabled name="amount" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
            <div className='flex justify-center space-x-4 my-6'>
                {(edit && status === 'PAYMENT_PENDING' )&& <Button className="my-6 px-8 bg-white text-black border-2 border-black rounded-xl" onClick={onEditPress}>
                    Edit
                </Button>}
                {!edit && status && (
                    <Button className="my-6 px-8 bg-white text-black border-2 border-black rounded-xl" onClick={handleSave}>
                        Save
                    </Button>
                )}
                <Button onClick={() => navigate('/dashboard/finance/invoice')} className={`my-6 px-8 ${ColorStyles.backButton}`}>
                    Back
                </Button>
                <Button onClick={handleDownloadPDF} className="my-6 px-8 text-white border-2 bg-green-500 rounded-xl">
                    Download PDF
                </Button>
            </div>
        </>
    );
};

export default InvoiceDetails;
