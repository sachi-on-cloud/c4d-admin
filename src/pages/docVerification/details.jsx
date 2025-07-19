import { useLocation, useParams, useNavigate } from "react-router-dom";
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
import { Formik, Form, Field, ErrorMessage } from "formik";
import DocumentsList from "@/components/DocumentsList";

const DocumentsDetails = () => {
  const location = useLocation();
  const { type } = location.state || {};
  const [documentData, setdocumentData] = useState([]);
  const [user, setUser] = useState('');
  const [initialValues, setInitialValues] = useState({});
  const [modalData, setModalData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // console.log("TYPE--->", type);
      const loggedInUser = localStorage.getItem('loggedInUser');
      const name = JSON.parse(loggedInUser).name;
      // console.log('name ->', name);
      setUser(name);
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DOCUMENT_DETAILS, {
        "id": id,
        "user": type.toLowerCase()
      })
      // console.log("DATA IN DETAILS DOC", data);
      if (type == 'Register') {
        setInitialValues({
          salutation: data?.data?.salutation || '',
          firstName: data?.data?.firstName || '',
          phoneNumber: data?.data?.phoneNumber ? data?.data?.phoneNumber.replace(/^(\+91)/, '') : "",
          id: data?.data?.id || ''
        })
      }
      if (data.success) {
        setdocumentData(data?.data?.Proofs);
      }
    }
    fetchData();
  }, [modalData])

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

  const handleStatusChange = async (docId, status) => {
    const docData = {
      documentId: docId,
      status: status,
      verifiedBy: user
    };
    const data = await ApiRequestUtils.update(API_ROUTES.GET_DOCUMENT_DETAILS_LIST, docData);
    // console.log("DATAAA", data)
    if (data?.success) {
      alert(`Document status updated to ${status}`);
      const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.GET_DOCUMENT_DETAILS, {
        "id": id,
        "user": type
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
      <div>
        {type == 'Driver' && <DriverDetails btnShow={true} noApprove={true} />}
        {type == 'Cab' && <CabDetails btnShow={true} noApprove={true} />}
        {type == 'Account' && <AccountDetails btnShow={true} noApprove={true} />}
        {type == 'Register' && <>
          <div className="p-4">

            <h2 className="text-2xl font-bold mb-4">Registered User Details</h2>
            <Formik
              initialValues={initialValues}
              onSubmit={() => { }}
              enableReinitialize={true}
            >
              {({ values }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="salutation" className="text-sm font-medium text-gray-700">Salutation</label>
                      <Field as="select" disabled name="salutation" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                        <option value="">Select salutation</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Miss">Miss</option>
                        <option value="Others">Others</option>
                      </Field>
                      <ErrorMessage name="salutation" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div>
                      <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
                      <Field type="text" disabled name="firstName" className="p-2 w-full rounded-md border bg-gray-200 border-gray-300 shadow-sm" />
                      <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm my-1" />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                      <Field type="tel" disabled name="phoneNumber" className="p-2 w-full rounded-md bg-gray-200 border border-gray-300" maxLength={10} />
                      <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                    </div>

                  </div>
                </Form>
              )}
            </Formik>
          </div>
          {initialValues && initialValues?.id && <DocumentsList id={initialValues.id} type={'register'} noApprove={true} />}
        </>
        }
        <div className="flex justify-center mt-5">
          <Button className="bg-white text-black" onClick={() => navigate(`/dashboard/doc-verification`)} >Back</Button>
        </div>
      </div>
    </>)
};

export default DocumentsDetails;