import { useLocation, useParams,useNavigate  } from "react-router-dom";
import CabDetails from "../cab/details";
import AccountDetails from "../account/details";
import DriverDetails from "../driver/details";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
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

const DocumentsDetails = () => {
    const location = useLocation();
    const {type} = location.state || {};
    const [documentData, setdocumentData] = useState([]);
    const [modalData, setModalData] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(()=>{
        const fetchData = async () =>{
            console.log("TYPE--->",type);
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DOCUMENT_DETAILS, {
                "id": id,
                "user": type.toLowerCase()
            })
            console.log("DATA IN DETAILS DOC",data)
            if(data.success){
                setdocumentData(data?.data?.Proofs);
            }
        }
        fetchData();
    },[modalData])

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

    const handleStatusChange = async (docId,status) => {
        const docData = {
          documentId: docId,
          status : status,
          //verifiedBy : "verify"
        };
        const data = await ApiRequestUtils.update(API_ROUTES.GET_DOCUMENT_DETAILS_LIST, docData);
        console.log("DATAAA",data)
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

    return(
    <>
        <div>
            {type == 'Driver' && <DriverDetails btnShow={true}/>}
            {type == 'Cab' && <CabDetails btnShow={true}/>}
            {type == 'Account' && <AccountDetails btnShow={true}/>}
        </div>
        <div className='flex flex-row justify-between px-2 mb-2'>
            <h2 className="text-2xl font-bold mb-4">Documents</h2>
        </div>
        <Card>
        {documentData && documentData.length> 0 ? (
          <>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {[
                      "Type",
                      "Status",
                      "Verified By",
                      "View Details"
                    ].map((el, index) => (
                      <th
                        key={index}
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
                  {documentData.map(
                      ({id, type, image1, status},key) => {
                        const className = `py-3 px-5 ${ 
                          key === documentData.length - 1 
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
                                  className={`text-xs font-semibold ${
                                    status === 'PENDING' ? 'text-blue-500' :
                                    status === 'APPROVED' ? 'text-green-500' :
                                    status === 'DECLINED' ? 'text-red-500' : ''
                                  }`}
                                
                                >
                                  {status}
                                </Typography>
                              </td>
                              <td className={className}>
                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                  verifiedBy
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
                                        });
                                      }}
                                    >
                                      View Details
                                    </Typography>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </>
                        );
                      }
                    )}
                </tbody>
              </table>
            </CardBody>
          </>):(
            <h2 className="text-lg font-medium p-4">No Documents</h2>
        )
      }
      </Card>
      <div className="flex justify-center mt-5">
        <Button className="" onClick={()=> navigate(`/dashboard/doc-verification`)} >Back</Button>
      </div>
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
                        <Typography variant="body1" className="text-gray-600">
                            Verified By : Admin Name
                        </Typography>
                    </div>
                    </DialogBody>
            <DialogFooter>
            {modalData.status != "APPROVED" && 
            <>
                <Button
                    onClick={() => handleStatusChange(modalData.id, "APPROVED")}
                    className="mr-5 text-xs font-semibold text-black bg-white border border-black"
                >
                    Approve
                </Button>
                <Button
                    onClick={() => handleStatusChange(modalData.id, "DECLINED")}
                    className="text-xs font-semibold text-white"
                >
                    Decline
                </Button>
            </>}
            </DialogFooter>
        </Dialog>      
      )}
    </>)
};

export default DocumentsDetails;