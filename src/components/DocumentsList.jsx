import { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const DocumentsList = ({ id, type}) => {
    const [documentData, setdocumentData] = useState([]);
    const [modalData, setModalData] = useState(null);
    const navigate = useNavigate();
    const [isDeclining, setIsDeclining] = useState(false);
    const [declineReason, setDeclineReason] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DOCUMENT_DETAILS, {
                "id": id,
                "user": type.toLowerCase()
            })
            console.log("DATA IN DETAILS DOC", data);
            if (data.success) {
                setdocumentData(data?.data?.Proofs);
            }
        }
        fetchData();
    }, [modalData, id, type]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
          case "pending":
            return "text-blue-500";
          case "approved":
            return "text-green-500";
          case "declined":
            return "text-red-500";
          default:
            return "text-gray-500";
        }
    };

    const handleStatusChange = async (docId,status,reason) => {
        const docData = {
          documentId: docId,
          status : status,
          comments: reason,
        };
        const data = await ApiRequestUtils.update(API_ROUTES.GET_DOCUMENT_DETAILS_LIST, docData);
        // console.log("DATAAA",data)
        if (data?.success) {
          alert(`Document status updated to ${status}`);
          const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DOCUMENT_DETAILS, {
            "id": id,
            "user":type
          })
          if (data?.success) {
            setModalData(null)
          }
        } else {
          alert("Failed to update status. Please try again.");
        }
    };

    return (
        <>
            <div className='flex flex-row justify-between px-2 mb-2 mt-4'>
                <h2 className="text-2xl font-bold mb-4">Documents</h2>
            </div>
            <Card>
                {documentData && documentData.length > 0 ? (
                    <>
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {[
                                            "Type",
                                            "Status",
                                            "View Details",
                                            "Created At",
                                            "Verified By",
                                            "Verified At"
                                        ].map((el, index) => (
                                            <th
                                                key={index}
                                                className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                            >
                                                <Typography
                                                    variant="small"
                                                    className="text-[11px] font-bold uppercase text-blue-gray-700"
                                                >
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {documentData.map(
                                        ({ id, type, image1, status, User, created_at, updated_at }, key) => {
                                            const className = `py-3 px-5 ${key === documentData.length - 1
                                                    ? ""
                                                    : "border-b border-blue-gray-50"
                                                }`;
                                            return (
                                                <>
                                                    <tr key={id}>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {type}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography
                                                                className={`text-xs font-semibold ${status === 'PENDING' ? 'text-blue-500' :
                                                                        status === 'APPROVED' ? 'text-green-500' :
                                                                            status === 'DECLINED' ? 'text-red-500' : ''
                                                                    }`}

                                                            >
                                                                {status}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <div className="flex items-center gap-4">
                                                                <div>
                                                                    <Typography
                                                                        variant="small"
                                                                        className="font-semibold underline cursor-pointer text-blue-900"
                                                                        onClick={() => {
                                                                            setModalData({
                                                                                id,
                                                                                image: image1,
                                                                                status,
                                                                                User
                                                                            });
                                                                        }}
                                                                    >
                                                                        View Details
                                                                    </Typography>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {moment(created_at).format("DD-MM-YYYY")}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {User ? User?.name : ''}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {status !== 'PENDING' ? moment(updated_at).format("DD-MM-YYYY") : ""}
                                                            </Typography>
                                                        </td>
                                                    </tr>
                                                </>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </CardBody>
                    </>) : (
                    <h2 className="text-lg font-medium p-4">No Documents</h2>
                )
                }
            </Card>
            {modalData && (
                <Dialog open={Boolean(modalData)} handler={() => setModalData(null)} size="md">
                    <DialogHeader>
                        <div className="flex justify-between items-center w-full">
                            <Typography variant="h6">Document Details</Typography>
                            <button
                                className="text-gray-600 hover:text-gray-900"
                                onClick={() => setModalData(null)}
                            >
                                X
                            </button>
                        </div>
                    </DialogHeader>
                    <DialogBody divider>
                        <div className="flex flex-col items-center">
                            <img
                                src={modalData.image}
                                alt="Document"
                                className="max-w-full rounded-lg shadow-md mb-4"
                                style={{ height: "45vh", objectFit: "contain" }}
                            />
                            <Typography variant="body1" className="text-gray-600">
                                Document Status: <span className={getStatusColor(modalData.status)}>{modalData.status}</span>
                            </Typography>
                            {modalData.status !== 'PENDING' && <Typography variant="body1" className="text-gray-600">
                                Verified By : {modalData.User ? modalData?.User?.name : ''}
                            </Typography>}
                        </div>
                        {isDeclining && (
                            <div className="mt-4 w-full">
                                <Typography variant="body2" className="text-gray-600 mb-2">
                                    Please enter a reason for declining:
                                </Typography>
                                <textarea
                                    className="p-2 border rounded-md w-full text-black"
                                    placeholder="Enter reason here..."
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                />
                            </div>
                        )}
                    </DialogBody>
                    <DialogFooter className="flex flex-col items-center">
                    {!isDeclining ? (
                        <div className="flex space-x-5">
                            <Button
                                onClick={() => handleStatusChange(modalData.id, "APPROVED", "")}
                                className="text-xs font-semibold text-black bg-white border border-black px-4 py-2"
                            >
                                Approve
                            </Button>
                            <Button
                                onClick={() => setIsDeclining(true)}
                                className="text-xs font-semibold text-white bg-black px-4 py-2"
                            >
                                Decline
                            </Button>
                        </div>
                    ) : (
                        <div className="flex space-x-4">
                            <Button
                                onClick={() => setIsDeclining(false)}
                                className="text-xs font-semibold text-black bg-gray-300 px-4 py-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    handleStatusChange(modalData.id, "DECLINED", declineReason);
                                    setIsDeclining(false);
                                }}
                                className="bg-blue-400 text-white px-4 py-2"
                                disabled={!declineReason.trim()}
                            >
                                Send
                            </Button>
                        </div>
                    )}
                    </DialogFooter>
                </Dialog>
            )}
        </>
    )
};

export default DocumentsList;