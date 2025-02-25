import React, { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import { Button } from '@material-tailwind/react';
import { useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceDetails = () => {
    const [invoice, setInvoice] = useState({});
    const { id } = useParams();
    const navigate = useNavigate();
    const pdfRef = useRef();
    const [edit, setEdit] = useState(false);
    const [status,setStatus] = useState("");

    useEffect(() => {
        if (id) {
            fetchInvoice(id);
        }
    }, [id]);

    const fetchInvoice = async (invoiceId) => {
        try {
            // const data = await ApiRequestUtils.get(`${API_ROUTES.GET_RECEIPT_DETAILS}/${receiptId}`);
            // const data = [
            //     {
            //         "invoiceNumber": "INV-20240201-001",
            //         "invoiceType": "Subscription",
            //         "invoiceCreatedDate": "2024-02-01",
            //         "package": "Premium Driver Package",
            //         "driverName": { "value": "John Doe", "link": "/drivers/DR001" },
            //         "driverPhoneNumber": "+91 9876543210",
            //         "status": "Pending Payment",
            //         "paymentMethod": "Online",
            //         "amount": "₹2500"
            //     },
            //     {
            //         "invoiceNumber": "INV-20240201-002",
            //         "invoiceType": "Subscription",
            //         "invoiceCreatedDate": "2024-02-02",
            //         "package": "Basic Driver Package",
            //         "driverName": { "value": "Jane Smith", "link": "/drivers/DR002" },
            //         "driverPhoneNumber": "+91 9876543211",
            //         "status": "Pending Payment",
            //         "paymentMethod": "Online",
            //         "amount": "₹1500"
            //     }
            // ];
            const data =[];
            
            setInvoice(data[0]);
            if(data[0].status == "Pending Payment"){
                setEdit(true);
            }
        } catch (error) {
            console.error("Error fetching invoice details:", error);
        }
    };

    const handleDownloadPDF = () => {
        const input = pdfRef.current;
        html2canvas(input).then((canvas) => {
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

    const handleSave = () => {
        console.log("Selected Status:", status);
        setEdit(true); // Lock the dropdown again after saving
    };

    return (
        <>
            <div className="p-4 mx-auto">
                <h2 className="text-2xl font-bold mb-4">Invoice Details</h2>
                <div ref={pdfRef}>
                    <Formik initialValues={invoice} enableReinitialize>
                        {(values) => (
                            <Form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Invoice Number</label>
                                        <Field type="text" disabled name="invoiceNumber" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Invoice Type</label>
                                        <Field type="text" disabled name="invoiceType" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Created Date</label>
                                        <Field type="text" disabled name="invoiceCreatedDate" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Package</label>
                                        <Field type="text" disabled name="package" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Driver Name</label>
                                        <Field type="text" disabled name="driverName.value" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Driver Phone Number</label>
                                        <Field type="text" disabled name="driverPhoneNumber" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Status</label>
                                        <Field as="select" name="status" disabled={edit} className="p-2 w-full rounded-md border border-gray-300 bg-white"
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Pending Payment">Pending Payment</option>
                                            <option value="Payment Completed">Payment Completed</option>
                                            <option value="Payment Cancelled">Payment Cancelled</option>
                                        </Field>                                    
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Payment Method</label>
                                        <Field type="text" disabled name="paymentMethod" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Amount</label>
                                        <Field type="text" disabled name="amount" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300" />
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
            <div className='flex justify-center space-x-4 my-6'>
                {edit && <Button className="my-6 px-8 bg-white text-black border-2 border-black rounded-xl" onClick={onEditPress}>
                    Edit
                </Button>}
                {!edit && status && (
                    <Button className="my-6 px-8 bg-white text-black border-2 border-black rounded-xl" onClick={handleSave}>
                        Save
                    </Button>
                )}
                <Button onClick={() => navigate('/dashboard/finance/invoice')} className='my-6 px-8 text-white border-2 bg-black rounded-xl'>
                    Back
                </Button>
                <Button onClick={handleDownloadPDF} className="my-6 px-8 text-white border-2 bg-blue-600 rounded-xl">
                    Download PDF
                </Button>
            </div>
        </>
    );
};

export default InvoiceDetails;
