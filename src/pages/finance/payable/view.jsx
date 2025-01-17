import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Alert, 
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import moment from 'moment';


export function PayableView() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [alert, setAlert] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [comments, setComments] = useState("");
  const [transactionIdError, setTransactionIdError] = useState(false);


  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_PAYABLE);
      console.log("PAYABLE",data)
      if (data?.success) {
        setAccounts(data?.data);
      }
    };
    fetchAccounts();
  }, []);

  const handleVerify = async (type, id, status, transactionId, commments = "") =>{
    if(type === 'Approve'){
      const payData = {
        requestId: id,
        status: status,
        transactionId : transactionId,
        commments : commments
      };
      const data = await ApiRequestUtils.update(API_ROUTES.APPROVE_PAYMENT_REQUEST, payData);
      console.log("APPROVER PAU+YMENT REQESR",data);
    }else{
      const payData ={
        requestId: id,
        status: status,
      }
      const data = await ApiRequestUtils.update(API_ROUTES.REVIEW_PAYMENT_REQUEST, payData);
      console.log("PAYADATA CONSOLE",data);
    }
    setModalData(null);
  } 

  return (
    <div className="mb-8 flex flex-col gap-12">
      {alert && (
        <div className='mb-2'>
          <Alert
            color='blue'
            className='py-3 px-6 rounded-xl'
          >
            {alert.message}
          </Alert>
        </div>)}
        <div className="flex items-center justify-between">
            <div className="relative flex-grow max-w-[500px]">
            <input
                type="text"
                className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search User"
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            </div>
        </div>

      <Card>
        {accounts.length > 0 ? (
          <>
            <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex-1 justify-between items-center">
              <Typography variant="h6" color="white">
                Payable List
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Invoice Number", "Total Amount", "Total Payout", "Cash", "Online", "Commission" , "Payables",  "Reviewed By", "Reviewed Date","Approved By","Approved Date", "Status",""].map((el) => (
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
                  {accounts.map(
                    ({invoiceNumber, status, totalPayables, totalAmount, totalPayout, commissionAmount, cashAmount, onlineAmount, reviewedBy, approver, reviewer, reviewedTime, approvedBy, approvedTime, id, transactionId, comments}, key) => {
                      const className = `py-3 px-5 ${key === accounts.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;

                      return (
                        <tr key={""}>
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <div onClick={() => {navigate(`/dashboard/finance/payable/details/${id}`)}}>
                                <Typography
                                  variant="small"
                                  color="blue"
                                  className="font-semibold underline"
                                >
                                  {invoiceNumber}
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {totalAmount}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {totalPayout}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {cashAmount}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {onlineAmount}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {commissionAmount}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {totalPayables}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {/* {approvedBy} */}{reviewer?.name}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {moment(reviewedTime).format("DD-MM-YYYY")}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {/* {approvedBy} */}{approver?.name}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {moment(approvedTime).format("DD-MM-YYYY")}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {status}
                            </Typography>
                          </td>
                          <td className={className}>
                            {!reviewer?.name && <Button
                              as='a'
                              onClick={() => {
                                setModalData({
                                  id,
                                  status,
                                  totalPayables,
                                  "type":"Review",
                                  invoiceNumber
                                });
                            }}
                              className="mr-3 text-xs font-semibold text-black bg-white border border-black"
                            >
                              Review
                            </Button>}
                            {!approver?.name && <Button
                              as='a'
                              onClick={() => {
                                setModalData({
                                  id,
                                  status,
                                  totalPayables,
                                  "type":"Approve",
                                  invoiceNumber
                                });
                              }}
                              className="text-xs font-semibold text-white"
                            >
                              Approve
                            </Button>}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </CardBody>
          </>) : (
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              No Payables
            </Typography>
          </CardHeader>
        )}
      </Card>
      {modalData && (
        <Dialog open={Boolean(modalData)} handler={() => setModalData(null)} size="sm">
            <DialogHeader>
                <div className="flex justify-between items-center w-full">
                    <Typography variant="h6" className="font-bold text-gray-800">
                        {modalData.type}
                    </Typography>
                    <button
                        className="text-gray-500 hover:text-gray-900 transition duration-150"
                        onClick={() => setModalData(null)}
                        aria-label="Close"
                    >
                        ✖
                    </button>
                </div>
            </DialogHeader>
            <DialogBody divider>
                <div className="flex flex-col items-start gap-y-4">
                    <div className="flex flex-col items-start">
                        <Typography className="font-semibold text-gray-800 text-sm">
                            Invoice Number:
                        </Typography>
                        <Typography className="text-gray-700 text-base font-medium">
                          {modalData.invoiceNumber}
                        </Typography>
                    </div>
                    <div className="flex flex-col items-start">
                        <Typography className="font-semibold text-gray-800 text-sm">
                            Status:
                        </Typography>
                        <Typography className="text-base font-medium">{modalData.status}</Typography>
                    </div>
                    <div className="flex flex-col items-start">
                        <Typography className="font-semibold text-gray-800 text-sm">
                            Amount:
                        </Typography>
                        <Typography className="text-gray-700 text-base font-medium">
                            {modalData.totalPayables}
                        </Typography>
                    </div>

                    {modalData.type === "Approve" && (
                        <>
                            <div className="flex flex-col">
                                <label htmlFor="transactionId" className="text-sm font-semibold text-gray-800">
                                    Transaction ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="transactionId"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    className={`border rounded-md px-3 py-2 focus:ring ${
                                        transactionIdError ? "border-red-500" : "focus:ring-blue-500"
                                    }`}
                                    placeholder="Enter Transaction ID"
                                />
                                {transactionIdError && (
                                    <span className="text-red-500 text-xs mt-1">
                                        Transaction ID is required.
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="comments" className="text-sm font-semibold text-gray-800">
                                    Comments
                                </label>
                                <textarea
                                    id="comments"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    className="border rounded-md px-3 py-2 focus:ring focus:ring-blue-500"
                                    placeholder="Enter Comments"
                                />
                            </div>
                        </>
                    )}
                </div>
            </DialogBody>
            <DialogFooter>
                <div className="flex justify-end w-full gap-x-3">
                    {modalData.type === "Review" && (
                        <>
                            <Button
                                onClick={() => handleVerify(modalData.type, modalData.id, "VERIFIED")}
                                className="mr-3 text-xs font-semibold text-black bg-white border border-black"
                            >
                                Verify
                            </Button>
                            <Button
                                onClick={() => handleVerify(modalData.type, modalData.id, "CANCELLED")}
                                className="text-xs font-semibold text-white"
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {modalData.type === "Approve" && (
                        <>
                            <Button
                                onClick={() => {
                                    if (!transactionId.trim()) {
                                        setTransactionIdError(true);
                                        return;
                                    }
                                    setTransactionIdError(false);
                                    handleVerify(
                                        modalData.type,
                                        modalData.id,
                                        "COMPLETED",
                                        transactionId,
                                        comments
                                    );
                                }}
                                className="mr-3 text-xs font-semibold text-black bg-white border border-black"
                            >
                                Completed
                            </Button>
                            <Button
                                onClick={() => handleVerify(modalData.type, modalData.id, "CANCELLED", transactionId, comments)}
                                className="text-xs font-semibold text-white"
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                </div>
            </DialogFooter>
        </Dialog>
      )}

    </div>
  );
}

export default PayableView;
