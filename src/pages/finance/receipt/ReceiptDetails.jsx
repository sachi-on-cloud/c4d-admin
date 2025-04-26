import React, { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReceiptDetails = () => {
    const [receipt, setReceipt] = useState({});
    const { receiptNumber } = useParams();
    const navigate = useNavigate();
    const pdfRef = useRef();

    useEffect(() => {
        if (receiptNumber) {
            fetchReceipt(receiptNumber);
        }
    }, [receiptNumber]);

    const fetchReceipt = async (receiptId) => {
        try {
            const data = await ApiRequestUtils.get(`${API_ROUTES.GET_RECEIPT_DETAILS}/${receiptId}`);
            setReceipt(data?.data);
        } catch (error) {
            console.error("Error fetching receipt details:", error);
        }
    };

    const initialValues = {
        receiptNumber: receipt?.receiptNumber || "",
        receiptType: receipt?.receiptType || "",
        // contractNumber: receipt?.contractNumber?.value || "",
        createdDate: formatDate(receipt?.created_at) || "",
        packageType: receipt?.Subscription?.Plan?.name || "",
        driverName: receipt?.Driver?.firstName || "",
        driverPhoneNumber: receipt?.Driver?.phoneNumber || "",
        paymentMethod: receipt?.paymentType || "",
        totalAmount: receipt?.amount || "",
        ownerName: receipt?.Subscription?.Cab?.Account?.name || '',
        ownerPhoneNumber : receipt?.Subscription?.Cab?.Account?.phone_number || ''
    };

    function formatDate(isoDateString) {
        const date = new Date(isoDateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

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

    return (
        <>
            <div className="p-4 mx-auto">
                <h2 className="text-2xl font-bold mb-4">Receipt Details</h2>
                <div ref={pdfRef}>
                    <Formik initialValues={initialValues} enableReinitialize>
                        {() => (
                            <Form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Receipt Number</label>
                                        <Field type="text" disabled name="receiptNumber" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm" />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Receipt Type</label>
                                        <Field type="text" disabled name="receiptType" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    {/* <div>
                                        <label className="text-sm font-medium text-gray-700">Contract Number</label>
                                        <Field type="text" disabled name="contractNumber" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div> */}
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Created Date</label>
                                        <Field type="text" disabled name="createdDate" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                   {initialValues?.receiptType !== 'BOOKING' && <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Package Type</label>
                                        <Field type="text" disabled name="packageType" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>}
                                    {<><div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Driver Name</label>
                                        <Field type="text" disabled name="driverName" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Driver Phone Number</label>
                                        <Field type="text" disabled name="driverPhoneNumber" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div></>}
                                    {<><div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Owner Name</label>
                                        <Field type="text" disabled name="ownerName" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Owner Phone Number</label>
                                        <Field type="text" disabled name="ownerPhoneNumber" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div></>}
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Payment Method</label>
                                        <Field type="text" disabled name="paymentMethod" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-sm font-medium text-gray-700">Total Amount</label>
                                        <Field type="text" disabled name="totalAmount" className="p-2 h-[50px] w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
            <div className='flex justify-center space-x-4 my-6'>
                <Button
                    onClick={() => { navigate('/dashboard/finance/receipt'); }}
                    className={`my-6 px-8 ${ColorStyles.backButton}`}
                >
                    Back
                </Button>
                <Button
                    onClick={handleDownloadPDF}
                    className="my-6 px-8 text-white border-2 bg-green-500 rounded-xl"
                >
                    Download PDF
                </Button>
            </div>
        </>
    );
};

export default ReceiptDetails;
