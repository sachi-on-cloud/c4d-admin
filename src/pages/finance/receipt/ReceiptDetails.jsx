import React, { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES } from '@/utils/constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReceiptDetails = () => {
    const [receipt, setReceipt] = useState({});
    const { id } = useParams();
    const navigate = useNavigate();
    const pdfRef = useRef();

    useEffect(() => {
        if (id) {
            fetchReceipt(id);
        }
    }, [id]);

    const fetchReceipt = async (receiptId) => {
        try {
            // const data = await ApiRequestUtils.get(`${API_ROUTES.GET_RECEIPT_DETAILS}/${receiptId}`);
            const data = [
                {
                  "receiptNumber": "REC-20240201-001",
                  "receiptType": "Subscription",
                  "contractNumber": {
                    "value": "CN-20240201-DR001",
                    "link": "/contracts/CN-20240201-DR001"
                  },
                  "createdDate": "2024-02-01",
                  "packageType": "Premium Driver Package",
                  "driverName": {
                    "value": "John Doe",
                    "link": "/drivers/DR001"
                  },
                  "driverPhoneNumber": "+91 9876543210",
                  "paymentMethod": "Online",
                  "totalAmount": "₹2500"
                },
                {
                  "receiptNumber": "REC-20240201-002",
                  "receiptType": "Subscription",
                  "contractNumber": {
                    "value": "CN-20240201-DR002",
                    "link": "/contracts/CN-20240201-DR002"
                  },
                  "createdDate": "2024-02-01",
                  "packageType": "Basic Driver Package",
                  "driverName": {
                    "value": "Jane Smith",
                    "link": "/drivers/DR002"
                  },
                  "driverPhoneNumber": "+91 9876543211",
                  "paymentMethod": "Online",
                  "totalAmount": "₹1500"
                }
            ];
            setReceipt(data);
        } catch (error) {
            console.error("Error fetching receipt details:", error);
        }
    };

    const initialValues = {
        receiptNumber: receipt[1]?.receiptNumber || "",
        receiptType: receipt[1]?.receiptType || "",
        contractNumber: receipt[1]?.contractNumber?.value || "",
        createdDate: receipt[1]?.createdDate || "",
        packageType: receipt[1]?.packageType || "",
        driverName: receipt[1]?.driverName?.value || "",
        driverPhoneNumber: receipt[1]?.driverPhoneNumber || "9645716298",
        paymentMethod: receipt[1]?.paymentMethod || "",
        totalAmount: receipt[1]?.totalAmount || ""
    };

    const handleDownloadPDF = () => {
        const input = pdfRef.current;
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`Receipt_${receipt.receiptNumber}.pdf`);
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
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Receipt Number</label>
                                        <Field type="text" disabled name="receiptNumber" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Receipt Type</label>
                                        <Field type="text" disabled name="receiptType" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Contract Number</label>
                                        <Field type="text" disabled name="contractNumber" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Created Date</label>
                                        <Field type="text" disabled name="createdDate" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Package Type</label>
                                        <Field type="text" disabled name="packageType" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Driver Name</label>
                                        <Field type="text" disabled name="driverName" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Driver Phone Number</label>
                                        <Field type="text" disabled name="driverPhoneNumber" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Payment Method</label>
                                        <Field type="text" disabled name="paymentMethod" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Total Amount</label>
                                        <Field type="text" disabled name="totalAmount" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
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
                    className='my-6 px-8 text-white border-2 bg-black rounded-xl'
                >
                    Back
                </Button>
                <Button
                    onClick={handleDownloadPDF}
                    className="my-6 px-8 text-white border-2 bg-blue-600 rounded-xl"
                >
                    Download PDF
                </Button>
            </div>
        </>
    );
};

export default ReceiptDetails;
