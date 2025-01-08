import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, DISTRICT_LIST, STATE_LIST ,THALUK_LIST} from '@/utils/constants';
import { ACCOUNT_ADD_SCHEMA } from '@/utils/validations';
import { Alert, Button ,Dialog, DialogHeader, DialogBody,Typography,Card,CardBody} from '@material-tailwind/react';
import { useNavigate, useParams } from "react-router-dom";
import Select from 'react-select'

const AccountAdd = (props) => {
    const [districtSearchText, setDistrictSearchText] = useState("");
    const [thalukSearchText, setThalukSearchText] = useState("");
    const [stateSearchText, setStateSearchText] = useState("");
    const [alert, setAlert] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState(null);
    const [modalData, setModalData] = useState(null);

   
    const initialValues = {
        name: "",
        phoneNumber:  "",
        email: "",
        type: "",
        street: "",
        thaluk: "",
        district: "",
        state: "",
        pincode: "",
        image1: ""
    };

    const onSubmit = async (values, { setSubmitting, setFieldError}) => {
        console.log('Form submission started with values:', values);
        try {
            const formData = new FormData();
        
            formData.append('name', values.name);
            formData.append('image1', values.image1);
            formData.append('extImage1', values.image1.name.split('.')[1]);
            formData.append('fileTypeImage1', values.image1.type);
            formData.append('phoneNumber', values.phoneNumber);
            formData.append('type', values.type);
            formData.append('email', values.email);
            formData.append('street', values.street);
            formData.append('thaluk', values.thaluk);
            formData.append('district', values.district);
            formData.append('state', values.state);
            formData.append('pincode', values.pincode);
            
            let data;
            data = await ApiRequestUtils.postDocs(API_ROUTES.CREATE_ACCOUNT, formData);
            console.log('data :', data)
                if (!data?.success && data?.code === 203) {
                    setAlert({ message: 'Account already exists!', color: 'red' });
                    setTimeout(() => setAlert(null), 5000);
                    resetForm();
                } else {
                    navigate('/dashboard/vendors/account', {
                        state: {
                            accountAdded:  true,
                            accountName: values.name
                        }
                    });
                }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
        setSubmitting(false);
    };

    const districtOptions = DISTRICT_LIST.map(district => ({
        id: district.value,
        name: district.label
    }));

    const thalukOptions = THALUK_LIST.map(thaluk=>({
        id:thaluk.value,
        name:thaluk.label
    }))

    const filteredDistricts = districtOptions.filter(district =>
        district.name.toLowerCase().includes(districtSearchText.toLowerCase())
    );

    const filteredThaluk = thalukOptions.filter(thaluk =>
        thaluk.name.toLowerCase().includes(thalukSearchText.toLowerCase())
    );

    const stateOptions = STATE_LIST.map(state => ({
        id: state.value,
        name: state.label
    }));

    const filteredState = stateOptions.filter(state => 
        state.name.toLowerCase().includes(stateSearchText.toLowerCase()) 
    );

    return (
        <div className="p-4">
            {alert && (
                <div className='mb-2'>
                    <Alert
                        color={alert.color}
                        className='py-3 px-6 rounded-xl'
                    >
                        {alert.message}
                    </Alert>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-4">Add new Account</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={ACCOUNT_ADD_SCHEMA}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, dirty, isValid, setFieldValue, values, errors, touched}) => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                <Field type="text" name="name" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Field type="text" name="phoneNumber" className="p-2 w-full rounded-md border-2 border-gray-300" maxLength={10} />
                                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                                <Field as="select" name="type" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                    <option value="">Select Type</option>
                                    <option value="Individual">Individual</option>
                                    <option value="Company">Company</option>
                                </Field>
                                <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                <Field type="email" name="email" className="p-2 w-full rounded-md border-2  shadow-sm border-gray-300" />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="street" className="text-sm font-medium text-gray-700">Street Name</label>
                                <Field type="text" name="street" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                                <ErrorMessage name="street" component="div" className="text-red-500 text-sm my-1" />
                            </div>

                            
                            <div>
                                <label htmlFor="thaluk" className="text-sm font-medium text-gray-700">
                                    Thaluk
                                </label>
                                <Select
                                    id="thaluk"
                                    options={filteredThaluk.map((thaluk) => ({
                                        value: thaluk.id,
                                        label: thaluk.name,
                                    }))}
                                    onChange={(selectedOption) =>
                                        setFieldValue("thaluk", selectedOption?.value || "")
                                    }
                                    placeholder="Search Thaluk"
                                    isSearchable
                                    className="w-full"
                                    classNamePrefix="react-select"
                                />
                                <ErrorMessage
                                    name="thaluk"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>     
                            <div>
                                <label htmlFor="district" className="text-sm font-medium text-gray-700">
                                    District
                                </label>
                                <Select
                                    id="district"
                                    options={filteredDistricts.map((district) => ({
                                        value: district.id,
                                        label: district.name,
                                    }))}
                                    onChange={(selectedOption) =>
                                        setFieldValue("district", selectedOption?.value || "")
                                    }
                                    placeholder="Select District"
                                    isSearchable
                                    className="w-full"
                                    classNamePrefix="react-select"
                                />
                                <ErrorMessage
                                    name="district"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="state" className="text-sm font-medium text-gray-700">
                                    State
                                </label>
                                <Select
                                    id="state"
                                    options={filteredState.map((state) => ({
                                        value: state.id,
                                        label: state.name,
                                    }))}
                                    onChange={(selectedOption) =>
                                        setFieldValue("state", selectedOption?.value || "")
                                    }
                                    placeholder="Select State"
                                    isSearchable
                                    className="w-full"
                                    classNamePrefix="react-select"
                                />
                                <ErrorMessage
                                    name="state"
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="pincode" className="text-sm font-medium text-gray-700">Pincode</label>
                                <Field type="text" name="pincode" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" maxlength={6} />
                                <ErrorMessage name="pincode" component="div" className="text-red-500 text-sm my-1" />
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex flex-row justify-between px-2 mb-2">
                                <h3 className="text-2xl font-bold">Document Upload</h3>
                            </div>
                            <Card>
                                <>
                                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                                    <table className="w-full min-w-[640px] table-auto">
                                        <thead>
                                        <tr>
                                            {["Type", "Status", "Action",""].map((el, index) => (
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
                                        <tr>
                                            <td className="py-3 px-5 border-b border-blue-gray-50">
                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                Aadhaar
                                            </Typography>
                                            </td>
                                            <td className="py-3 px-5 border-b border-blue-gray-50">
                                            <Typography
                                                className={`text-xs font-semibold ${values.image1 ? 'text-green-500' : 'text-blue-500'}`}
                                            >
                                                {values.image1 ? "UPLOADED" : "NO DOCUMENTS"}
                                            </Typography>
                                            </td>
                                            <td className="py-3 px-5 border-b border-blue-gray-50">
                                            <div className="flex items-center gap-2">
                                                <label
                                                htmlFor="image1"
                                                className="inline-block text-center text-white border border-gray-400 bg-black rounded-lg px-4 py-1 cursor-pointer"
                                                >
                                                Upload
                                                </label>
                                                <input
                                                type="file"
                                                accept="image/*"
                                                id="image1"
                                                name="image1"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                    setFieldValue("image1", file);
                                                    }
                                                }}
                                                className="hidden"
                                                />
                                            </div>
                                            </td>
                                            <td className="py-3 px-5 border-b border-blue-gray-50">
                                            {values.image1 && (
                                                <Typography
                                                variant="small"
                                                className="font-semibold underline cursor-pointer text-blue-900"
                                                onClick={() =>
                                                    setModalData({
                                                    image: URL.createObjectURL(values.image1),
                                                    })
                                                }
                                                >
                                                View Details
                                                </Typography>
                                            )}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    </CardBody>
                                </>
                            </Card>
                        </div>
                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => { navigate('/dashboard/vendors/account'); }}
                                className='my-6 mx-2 text-black border-2 border-gray-400 bg-white rounded-xl'
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                color="black"
                                onClick={handleSubmit}
                                disabled={!dirty || !isValid}
                                className='my-6 mx-2'
                            >
                                Continue
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
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
                        className="max-w-full rounded-lg shadow-md"
                        style={{ height: "45vh", objectFit: "contain" }}
                        />
                    </div>
                    </DialogBody>
                </Dialog>
                )}

        </div>
    );
};

export default AccountAdd;