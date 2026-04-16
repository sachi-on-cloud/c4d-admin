import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles, DISTRICT_LIST, KYC_PROCESS, STATE_LIST, THALUK_LIST } from '@/utils/constants';
import { Alert, Button, Input, List, ListItem, Dialog, DialogHeader, DialogBody, DialogFooter, Typography, Card, CardBody, Spinner } from '@material-tailwind/react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ACCOUNT_EDIT_SCHEMA } from '@/utils/validations';
import moment from 'moment';
import OwnerCabWizardLayout from '@/pages/account/wizard/OwnerCabWizardLayout';

const LocationInput = ({ field, form, suggestions, onSearch, disabled, onSelect }) => {
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        form.validateField(field.name);
    }, []);

    return (
        <div className="relative">
            <Input
                type="text"
                placeholder="Enter address"
                {...field}
                onChange={(e) => {
                    form.setFieldValue(field.name, e.target.value);
                    onSearch(e.target.value);
                    form.setFieldTouched(field.name, true, false);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    field.onBlur(e);
                    setTimeout(() => setIsFocused(false), 200);
                    form.validateField(field.name);
                }}
                className="pr-10"
                disabled={disabled}
            />
            {suggestions.length > 0 && isFocused && (
                <List className="w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                        <ListItem
                            key={index}
                            onClick={() => {
                                form.setFieldValue(field.name, suggestion);
                                onSelect(suggestion);
                                setIsFocused(false);
                                form.validateField(field.name);
                            }}
                            className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                        >
                            <Typography variant="small">{suggestion}</Typography>
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

const FormDirtyTracker = ({ onDirtyChange }) => {
    const { dirty } = useFormikContext();
    useEffect(() => {
        onDirtyChange(dirty);
    }, [dirty, onDirtyChange]);
    return null;
};

const DocumentUpload = ({ label, value, status, name, onChange, setModalData, fullDocVal }) => {
    const normalizedStatus = (status || "").toUpperCase();
    const statusColorClass = normalizedStatus === "APPROVED"
        ? "text-green-500"
        : normalizedStatus === "DECLINED"
            ? "text-red-500"
            : normalizedStatus === "PENDING_UPLOAD"
                ? "text-primary-500"
                : "text-amber-500";

    return (
        <tr>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className="text-xs font-semibold text-blue-gray-600">{label}</Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography
                    className={`text-xs font-semibold ${statusColorClass}`}
                >
                    {normalizedStatus || "PENDING_UPLOAD"}
                </Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className="text-xs font-semibold text-blue-gray-600">
                    {moment(fullDocVal?.created_at).format("DD-MM-YYYY")}
                </Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className="text-xs font-semibold text-blue-gray-600">{fullDocVal?.User?.name}</Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className="text-xs font-semibold text-blue-gray-600">
                    {fullDocVal?.updated_at ? moment(fullDocVal?.updated_at).format("DD-MM-YYYY") : ""}
                </Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <div className="flex items-center gap-2">
                    <label
                        htmlFor={name}
                        className="inline-block text-center text-white border border-gray-400 bg-primary rounded-lg px-4 py-1 cursor-pointer"
                    >
                        Update
                    </label>
                    <input
                        type="file"
                        accept="image/*, application/pdf"
                        id={name}
                        name={name}
                        onClick={(e) => {
                            // Allow selecting the same file again to re-trigger upload.
                            e.currentTarget.value = "";
                        }}
                        onChange={(e) => {
                            onChange(e);
                            // Reset so same file selection triggers onChange next time too.
                            e.currentTarget.value = "";
                        }}
                        className="hidden"
                        multiple={name !== "livePhoto" && name !== "bankStatement" && name !== "insurranceImage" && name !== "permitImage"}
                    />
                </div>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                {value && (
                    <Typography
                        variant="small"
                        className="font-semibold underline cursor-pointer text-primary-900"
                        onClick={() => {
                            if (label === 'Live Photo' || label === 'Bank Statement' || label === 'Insurance Image' || label === 'Permit Image') {
                                setModalData({
                                    id: fullDocVal?.id,
                                    type: fullDocVal?.type,
                                    status: fullDocVal?.status,
                                    User: fullDocVal?.User,
                                    image: fullDocVal?.image1
                                })
                            }
                            else {
                                setModalData({
                                    id: fullDocVal?.id,
                                    type: fullDocVal?.type,
                                    status: fullDocVal?.status,
                                    User: fullDocVal?.User,
                                    image: fullDocVal?.image1,

                                    image2: fullDocVal?.image2
                                });
                            }

                            // console.log(image2)
                        }}

                    >
                        View/Download
                    </Typography>
                )}
            </td>
        </tr>
    );
};

const DocumentStatusRow = ({ label, status, fullDocVal, setModalData }) => {
    const normalizedStatus = (status || "").toUpperCase();
    const statusColorClass = normalizedStatus === "APPROVED"
        ? "text-green-500"
        : normalizedStatus === "DECLINED"
            ? "text-red-500"
            : normalizedStatus === "PENDING_UPLOAD"
                ? "text-primary-500"
                : "text-amber-500";

    return (
        <tr>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className="text-xs font-semibold text-blue-gray-600">{label}</Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className={`text-xs font-semibold ${statusColorClass}`}>
                    {normalizedStatus || "PENDING_UPLOAD"}
                </Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className="text-xs font-semibold text-blue-gray-600">
                    {fullDocVal?.created_at ? moment(fullDocVal?.created_at).format("DD-MM-YYYY") : ""}
                </Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className="text-xs font-semibold text-blue-gray-600">{fullDocVal?.User?.name || ""}</Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className="text-xs font-semibold text-blue-gray-600">
                    {fullDocVal?.updated_at ? moment(fullDocVal?.updated_at).format("DD-MM-YYYY") : ""}
                </Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                <Typography className="text-xs text-blue-gray-400">-</Typography>
            </td>
            <td className="py-3 px-5 border-b border-blue-gray-50">
                {fullDocVal?.image1 ? (
                    <Typography
                        variant="small"
                        className="font-semibold underline cursor-pointer text-primary-900"
                        onClick={() =>
                            setModalData({
                                id: fullDocVal?.id,
                                type: fullDocVal?.type,
                                status: fullDocVal?.status,
                                User: fullDocVal?.User,
                                image: fullDocVal?.image1,
                                image2: fullDocVal?.image2,
                            })
                        }
                    >
                        View/Download
                    </Typography>
                ) : (
                    <Typography className="text-xs text-blue-gray-400">-</Typography>
                )}
            </td>
        </tr>
    );
};

const AccountEdit = () => {
    const [accountVal, setAccountVal] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [alert, setAlert] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [modalData, setModalData] = useState(null);
    const [isSameAddress, setIsSameAddress] = useState(false);
    const [thalukSearchText, setThalukSearchText] = useState("");
    const [districtSearchText, setDistrictSearchText] = useState("");
    const [stateSearchText, setStateSearchText] = useState("");
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [blockedReason, setBlockedReason] = useState(accountVal?.result?.blockedReason || '');
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [imagePreviews, setImagePreviews] = useState({
        aadhaarImage: null,
        policeClearance: null,
        livePhoto: null,
        drivingLicenseImage: null,
        vehiclePhotoImage: null,
        consentForm: null,
        panImage: null,
        rcImage: null,
        bankStatementImage: null,
        insurranceImage: null,
        permitImage: null,
    });
    const getNormalizedDocStatus = (doc) => {
        const normalized = (doc?.status || "").toUpperCase();
        if (normalized) return normalized;
        return doc?.image1 ? "PENDING" : "PENDING_UPLOAD";
    };
    const isDocumentApproved = (doc) => getNormalizedDocStatus(doc) === "APPROVED";
    const isAccountDocsApproved = isDocumentApproved(imagePreviews?.aadhaarImage) && isDocumentApproved(imagePreviews?.livePhoto);
    const isCabDocsApproved =
        isDocumentApproved(imagePreviews?.drivingLicenseImage) &&
        isDocumentApproved(imagePreviews?.rcImage) &&
        isDocumentApproved(imagePreviews?.vehiclePhotoImage) &&
        isDocumentApproved(imagePreviews?.insurranceImage) &&
        isDocumentApproved(imagePreviews?.permitImage);
    // Step 2 must stay open for add/edit when docs are still pending upload.
    const canEnterCabStep = true;
    const canEnterReviewStep = isAccountDocsApproved && isCabDocsApproved;

    const wizardSteps = [
        { key: 'account', label: 'Account Fields + Aadhaar + Live Photo' },
        { key: 'cab', label: 'Cab Fields + Cab Documents' },
        { key: 'review-submit', label: 'Review & Submit' },
    ];
    const stepKey = searchParams.get('step') || 'account';
    const isAccountStep = stepKey === 'account';
    const isCabStep = stepKey === 'cab';
    const isReviewStep = stepKey === 'review-submit';
    const currentStep = Math.max(1, wizardSteps.findIndex((step) => step.key === stepKey) + 1);

    useEffect(() => {
        if (!wizardSteps.some((step) => step.key === stepKey)) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('step', 'account');
            setSearchParams(nextParams, { replace: true });
        }
    }, [searchParams, setSearchParams, stepKey]);

    const handleStepChange = (stepNo) => {
        const step = wizardSteps[stepNo - 1];
        if (!step) return;
        const nextStepKey = step.key;
        if (nextStepKey === 'review-submit' && !canEnterReviewStep) {
            setAlert({
                message: "Account and cab documents must be approved before moving to Review.",
                color: "amber",
            });
            setTimeout(() => setAlert(null), 3000);
            return;
        }
        if (nextStepKey !== stepKey && isFormDirty) {
            const shouldLeave = window.confirm(
                "You have unsaved changes in this step. Do you want to switch steps without saving?"
            );
            if (!shouldLeave) return;
            setIsFormDirty(false);
        }
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('step', nextStepKey);
        setSearchParams(nextParams);
    };
    useEffect(() => {
        if (stepKey === 'review-submit' && !canEnterReviewStep) {
            const fallbackStep = canEnterCabStep ? 'cab' : 'account';
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('step', fallbackStep);
            setSearchParams(nextParams, { replace: true });
            setAlert({
                message: "Review is available only after account and cab documents are approved.",
                color: "amber",
            });
            setTimeout(() => setAlert(null), 3000);
        }
    }, [canEnterCabStep, canEnterReviewStep, searchParams, setSearchParams, stepKey]);
    useEffect(() => {
        if (stepKey === 'account' && isAccountDocsApproved) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('step', 'cab');
            setSearchParams(nextParams, { replace: true });
            setAlert({
                message: "All account documents approved. Moved to Step 2.",
                color: "green",
            });
            setTimeout(() => setAlert(null), 2000);
            return;
        }
        if (stepKey === 'cab' && isAccountDocsApproved && isCabDocsApproved) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('step', 'review-submit');
            setSearchParams(nextParams, { replace: true });
            setAlert({
                message: "All cab documents approved. Moved to Step 3.",
                color: "green",
            });
            setTimeout(() => setAlert(null), 2000);
        }
    }, [isAccountDocsApproved, isCabDocsApproved, searchParams, setSearchParams, stepKey]);

    useEffect(() => {
        fetchItem(id);
    }, [id]);
    const getDocumentByType = (value, type) => {
        return value.find(proof => proof.type === type) || "";
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner className="h-12 w-12" />
            </div>
        );
    }

    const fetchItem = async (itemId) => {
        const data = await ApiRequestUtils.get(`${API_ROUTES.GET_ACCOUNT_BY_ID}/${itemId}`);
        //console.log(' data - Fetch Item :', data?.data);
        setAccountVal(data?.data?.data);
        setBlockedReason(data?.data?.data?.blockedReason || '');
        setImagePreviews({
            aadhaarImage: getDocumentByType(data?.data?.data?.Proofs, KYC_PROCESS.AADHAAR),
            drivingLicenseImage: getDocumentByType(data?.data?.data?.Proofs, KYC_PROCESS.DRIVING_LICENSE),
            livePhoto: getDocumentByType(data?.data?.data?.Proofs, KYC_PROCESS.LIVE_PHOTO),
            bankStatementImage: getDocumentByType(data?.data?.data?.Proofs, KYC_PROCESS.BANK_STATEMENT),
            panImage: getDocumentByType(data?.data?.data?.Proofs, KYC_PROCESS.PAN),
            rcImage: getDocumentByType(data?.data?.data?.Proofs, KYC_PROCESS.RC_COPY),
            vehiclePhotoImage: getDocumentByType(data?.data?.data?.Proofs, KYC_PROCESS.VEHICLE_PHOTO),
            insurranceImage: getDocumentByType(data?.data?.data?.Proofs, KYC_PROCESS.INSURANCE),
            permitImage: getDocumentByType(data?.data?.data?.Proofs, KYC_PROCESS.PERMIT),
        });
    };
    const handleDocumentStatusChange = async (documentId, status) => {
        if (!documentId) {
            setAlert({
                message: "Upload the document first before updating status.",
                color: "amber",
            });
            setTimeout(() => setAlert(null), 2500);
            return;
        }
        const response = await ApiRequestUtils.update(API_ROUTES.GET_DOCUMENT_DETAILS_LIST, {
            documentId,
            status,
            comments: "",
        });
        if (response?.success) {
            setAlert({
                message: `Document status updated to ${status}.`,
                color: "green",
            });
            setModalData((prev) => (prev ? { ...prev, status } : prev));
            fetchItem(id);
        } else {
            setAlert({
                message: response?.message || "Failed to update document status.",
                color: "red",
            });
        }
        setTimeout(() => setAlert(null), 2500);
    };
    const getModalStatusColor = (status) => {
        const s = (status || "").toUpperCase();
        if (s === "APPROVED") return "text-green-500";
        if (s === "DECLINED" || s === "INVALID") return "text-red-500";
        if (s === "NOT_INTERESTED") return "text-orange-500";
        if (s === "NO_RESPONSE") return "text-gray-500";
        if (s === "PENDING_UPLOAD") return "text-primary-500";
        return "text-amber-500";
    };

    const initialValues = {
        name: accountVal?.name || "",
        phoneNumber: accountVal?.phoneNumber ? accountVal?.phoneNumber.replace(/^(\+91)/, '') : "",
        type: accountVal?.type || "",
        email: accountVal?.email || "",
        street: accountVal?.street || "",
        address: accountVal?.address || "",
        source: accountVal?.source || "",
        thaluk: accountVal?.thaluk || "",
        district: accountVal?.district || "",
        state: accountVal?.state || "",
        pincode: accountVal?.pincode || "",
        image1: accountVal?.Proofs ? accountVal?.Proofs[0]?.image1 : '',
        docDates: accountVal?.Proofs,
        ownerStatus:accountVal?.ownerStatus || ""
    };

    const handleImageUpload = async (e, setFieldValue, label, docId) => {
        try {
            setLoading(true);
            const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
            const maxSize = 10 * 1024 * 1024; // 10MB
            const files = e.target.files;
            console.debug("[AccountEdit][handleImageUpload] triggered", {
                label,
                docId: docId || null,
                fileCount: files?.length || 0,
                accountId: accountVal?.id,
            });
            if (!files || files.length === 0) {
                console.debug("[AccountEdit][handleImageUpload] no files selected", { label });
                setLoading(false);
                return;
            }

            if (files.length > 2) {
                setLoading(false);
                alert("You can upload a maximum of two documents.");
                console.debug("[AccountEdit][handleImageUpload] blocked: too many files", { label, count: files.length });
                return;
            }

            const uploadedFiles = [];
            const previews = {};

            for (let i = 0; i < files.length; i++) {
                if (!allowedTypes.includes(files[i].type)) {
                    setLoading(false);
                    console.debug("[AccountEdit][handleImageUpload] blocked: invalid type", {
                        label,
                        type: files[i].type,
                        name: files[i].name,
                    });
                    setAlert({
                        message: "Invalid file type. Please upload JPG, PNG, or PDF.",
                        color: "red",
                    });
                    setTimeout(() => setAlert(null), 5000);
                    return;
                }
                if (files[i].size > maxSize) {
                    setLoading(false);
                    console.debug("[AccountEdit][handleImageUpload] blocked: file too large", {
                        label,
                        size: files[i].size,
                        name: files[i].name,
                    });
                    setAlert({
                        message: "File size exceeds 10MB limit.",
                        color: "red",
                    });
                    setTimeout(() => setAlert(null), 5000);
                    return;
                }
                const file = files[i];
                uploadedFiles.push(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                    previews[`image${i + 1}`] = reader.result;
                    setImagePreviews((prev) => ({
                        ...prev,
                        [label]: {
                            ...prev[label],
                            ...previews,
                        },
                    }));
                };
                reader.readAsDataURL(file);
            }

            setFieldValue(label, uploadedFiles);
            const type = label === 'aadhaarImage' ? KYC_PROCESS.AADHAAR :
                label === 'rcImage' ? KYC_PROCESS.RC_COPY :
                    label === 'drivingLicenseImage' ? KYC_PROCESS.DRIVING_LICENSE :
                        label === 'vehiclePhotoImage' ? KYC_PROCESS.VEHICLE_PHOTO :
                        label === 'panImage' ? KYC_PROCESS.PAN : label === 'insurranceImage' ? KYC_PROCESS.INSURANCE : label === 'permitImage' ? KYC_PROCESS.PERMIT : '';

            const formData = new FormData();
            formData.append('type', type);
            formData.append('accountId', accountVal?.id);
            const isSingleFileDoc = label === "insurranceImage" || label === "permitImage";
            console.debug("[AccountEdit][handleImageUpload] prepared payload", {
                label,
                type,
                accountId: accountVal?.id,
                isUpdate: Boolean(docId),
                isSingleFileDoc,
            });

            if (files[0]) {
                formData.append('image1', files[0]);
                formData.append('extImage1', files[0].name.split('.').pop());
                formData.append('fileTypeImage1', files[0].type);
            }

            if (files[1] && !isSingleFileDoc) {
                formData.append('image2', files[1]);
                formData.append('extImage2', files[1].name.split('.').pop());
                formData.append('fileTypeImage2', files[1].type);
            }


            let data;
            if (!docId) {
                data = await ApiRequestUtils.postDocs(API_ROUTES.UPLOAD_PHOTO, formData);
            } else {
                formData.append('documentId', docId);
                data = await ApiRequestUtils.updateDocs(API_ROUTES.UPDATE_PHOTO, formData);
                //console.log("Data Updated => ", data)
            }
            console.debug("[AccountEdit][handleImageUpload] API response", {
                label,
                success: data?.success,
                message: data?.message,
                documentId: data?.data?.id,
            });
            if (data?.success) {
                setLoading(false);
                setImagePreviews((prev) => ({
                    ...prev,
                    [label]: {
                        image1: data?.data?.image1 || prev[label]?.image1,
                        image2: data?.data?.image2 || prev[label]?.image2,
                        id: data?.data?.id,
                    },
                }));
            }
            else {
                setLoading(false);
                setAlert({
                    message: data?.message || "Failed to upload document. Please try again.",
                    color: "red",
                });
                setTimeout(() => setAlert(null), 5000);
            }
        }
        catch (err) {
            console.error("[AccountEdit][handleImageUpload] error", { label, error: err });
            setLoading(false);
        }


    };
    const handlePhotoUpload = async (e, setFieldValue, label, docId) => {
        try {
            setLoading(true);
            const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
            const maxSize = 10 * 1024 * 1024; // 10MB
            const file = e.target.files[0];
            console.debug("[AccountEdit][handlePhotoUpload] triggered", {
                label,
                docId: docId || null,
                hasFile: Boolean(file),
                accountId: accountVal?.id,
            });
            if (!file) {
                console.debug("[AccountEdit][handlePhotoUpload] no file selected", { label });
                setLoading(false);
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                setLoading(false);
                console.debug("[AccountEdit][handlePhotoUpload] blocked: invalid type", {
                    label,
                    type: file.type,
                    name: file.name,
                });
                setAlert({
                    message: "Invalid file type. Please upload JPG, PNG, or PDF.",
                    color: "red",
                });
                setTimeout(() => setAlert(null), 5000);
                return;
            }

            if (file.size > maxSize) {
                setLoading(false);
                console.debug("[AccountEdit][handlePhotoUpload] blocked: file too large", {
                    label,
                    size: file.size,
                    name: file.name,
                });
                setAlert({
                    message: "File size exceeds 10MB limit.",
                    color: "red",
                });
                setTimeout(() => setAlert(null), 5000);
                return;
            }

            setFieldValue(label, file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => ({
                    ...prev,
                    [label]: reader.result,
                }));
            };
            reader.readAsDataURL(file);

            const type = label === 'livePhoto' ? KYC_PROCESS.LIVE_PHOTO : label === 'bankStatement' ? KYC_PROCESS.BANK_STATEMENT : '';
            const formData = new FormData();

            formData.append('image1', file);
            formData.append('extImage1', file.name.split('.')[1]);
            formData.append('fileTypeImage1', file.type);
            formData.append('type', type);
            formData.append('accountId', accountVal?.id);
            console.debug("[AccountEdit][handlePhotoUpload] prepared payload", {
                label,
                type,
                accountId: accountVal?.id,
                isUpdate: Boolean(docId),
            });


            let data;
            if (!docId) {
                data = await ApiRequestUtils.postDocs(API_ROUTES.UPLOAD_PHOTO, formData);
                // console.log("updated data => ",data)
            } else {

                formData.append('documentId', docId);
                data = await ApiRequestUtils.updateDocs(API_ROUTES.UPDATE_PHOTO, formData);
                // console.log("updated data => ", data)
            }
            console.debug("[AccountEdit][handlePhotoUpload] API response", {
                label,
                success: data?.success,
                message: data?.message,
                documentId: data?.data?.id,
            });
            if (data?.success) {
                setLoading(false);
                setImagePreviews((prev) => ({
                    ...prev,
                    [label]: {
                        image1: data?.data?.image1 || prev[label]?.image1,
                        id: data?.data?.id,
                    },
                }));
            }
            else {
                setLoading(false);
                setAlert({
                    message: data?.message || "Failed to upload photo. Please try again.",
                    color: "red",
                });
                setTimeout(() => setAlert(null), 5000);
            }
        }
        catch (err) {
            console.error("[AccountEdit][handlePhotoUpload] error", { label, error: err });
            setAlert({
                message: "An error occurred while uploading the photo.",
                color: "red",
            });
            setTimeout(() => setAlert(null), 5000);
            setLoading(false);
        }
    }
    const handleGoogleAddressSelect = () => {
        // Address value is already set by LocationInput via form.setFieldValue.
    };

    const searchLocations = async (query) => {
        if (query.length > 2) {
            const data = await ApiRequestUtils.getWithQueryParam(API_ROUTES.SEARCH_ADDRESS, {
                address: query
            });
            // console.log("data", data)
            if (data?.success && data?.data) {
                setAddressSuggestions(data?.data)
            }
        } else {
            setAddressSuggestions([]);
        }
    };

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        // console.log('onSubmit :', values)
        try {
            const formData = {
                type: values?.type ? values?.type : accountVal.type,
                name: values?.name ? values?.name : accountVal.name,
                phoneNumber: values?.phoneNumber ? values?.phoneNumber : accountVal.phoneNumber,
                email: values?.email ? values?.email : accountVal.email,
                address: values?.address ? values?.address : accountVal.address,
                street: values?.street ? values?.street : accountVal.street,
                thaluk: values?.thaluk ? values?.thaluk : accountVal.thaluk,
                district: values?.district ? values?.district : accountVal.district,
                state: values?.state ? values?.state : accountVal.state,
                pincode: values?.pincode ? values?.pincode : accountVal.pincode,
                source: values?.source ? values?.source : accountVal.source,
                accountId: accountVal?.id,
                ownerStatus: values?.ownerStatus ? values?.ownerStatus : accountVal.ownerStatus,
                blockedReason: values?.ownerStatus === 'Blocked' ? values?.blockedReason : '',
            }
            const data = await ApiRequestUtils.update(API_ROUTES.UPDATE_ACCOUNT, formData);
            if (data?.success) {
                await fetchItem(id);
                setAlert({
                    message: `${data?.data?.name || 'Account'} updated successfully!`,
                    color: 'green',
                });
                setTimeout(() => setAlert(null), 3000);
                resetForm({ values });
                setIsFormDirty(false);
                if (isAccountStep && isAccountDocsApproved) {
                    const nextParams = new URLSearchParams(searchParams);
                    nextParams.set('step', 'cab');
                    setSearchParams(nextParams);
                }
            }

        } catch (error) {
            console.error('Error creating driver and car:', error);
        }
        setSubmitting(false);
    };

    const districtOptions = DISTRICT_LIST.map(district => ({
        id: district.value,
        name: district.label
    }));

    const filteredDistricts = districtOptions.filter(district =>
        district.name.toLowerCase().includes(districtSearchText.toLowerCase())
    );

    const parseAddress = (address) => {
        if (!address || typeof address !== "string") {
            console.error("parseAddress received an undefined or invalid address");
            return {
                street: "",
                taluk: "",
                district: "",
                state: "",
                country: "",
                pincode: "",
            };
        }

        const parts = address.split(", ").reverse();
        return {
            street: parts[4] || "",
            taluk: parts[3] || "",
            district: parts[2] || "",
            state: parts[1] || "",
            country: parts[0] || "",
            pincode: "",
        };
    };

    const thalukOptions = THALUK_LIST.map(thaluk => ({
        id: thaluk.value,
        name: thaluk.label
    }));

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
        <div className="p-4 mx-auto">
            <OwnerCabWizardLayout
                title="Owner Edit Wizard"
                subtitle="Each step has its own URL page. Account step includes Aadhaar and Live Photo."
                steps={wizardSteps}
                currentStep={currentStep}
                onStepChange={handleStepChange}
            />
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
            <h2 className="text-2xl font-bold mb-4">
                {isAccountStep ? "Update Account" : isCabStep ? "Cab Documents" : "Review & Submit"}
            </h2>
            <Formik
                initialValues={initialValues}
                validationSchema={ACCOUNT_EDIT_SCHEMA}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ handleSubmit, values, errors, dirty, isValid, handleChange, setFieldValue }) => (
                    <Form className="space-y-4">
                        <FormDirtyTracker onDirtyChange={setIsFormDirty} />
                        {isAccountStep && (
                        <div className="grid grid-cols-1 gap-4">
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label htmlFor="type" className="text-sm font-medium text-gray-700">Service Type</label>
                                    <Field as="select" name="type" disabled className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                                        <option value="">Select Type</option>
                                        <option value="Individual">Owner cum Driver</option>
                                        <option value="Company">Travels</option>
                                    </Field>
                                    <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">{values.type === 'Individual' ? "Full Name" : 'Company Name'}</label>
                                    <Field type="text" name="name" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm" />
                                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                                <div>
                                    <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <Field type="text" name="phoneNumber" className="p-2 w-full rounded-md border-2 border-gray-300" maxLength={10} />
                                    <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="source" className="text-sm font-medium text-gray-700">Source</label>
                                    <Field as="select" name="source" className="p-2 w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
                                        <option value="">Select Type</option>
                                        <option value="Mobile App">Mobile App</option>
                                        <option value="Walk In">Walk In</option>
                                        <option value="Call">Call</option>
                                        <option value="Website">Website</option>
                                    </Field>
                                    <ErrorMessage name="source" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                    <Field type="email" name="email" className="p-2 w-full rounded-md border-2  shadow-sm border-gray-300" />
                                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="address" className="text-sm font-medium text-gray-700">Current Address</label>
                                    <Field name="address">
                                        {({ field, form }) => (
                                            <LocationInput
                                                field={field}
                                                form={form}
                                                suggestions={addressSuggestions}
                                                onSearch={searchLocations}
                                                onSelect={handleGoogleAddressSelect}
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>
                            <div className='space-y-2'>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        id="sameAddress"
                                        checked={isSameAddress}
                                        onChange={(e) => {
                                            setIsSameAddress(e.target.checked);
                                            if (e.target.checked) {
                                                const currentAddress = parseAddress(values.address);
                                                setFieldValue("street", currentAddress.street);
                                                setFieldValue("thaluk", currentAddress.taluk);
                                                setFieldValue("district", currentAddress.district);
                                                setFieldValue("state", currentAddress.state);
                                                setFieldValue("pincode", currentAddress.pincode);
                                            } else {
                                                setFieldValue("street", "");
                                                setFieldValue("thaluk", "");
                                                setFieldValue("district", "");
                                                setFieldValue("state", "");
                                                setFieldValue("pincode", "");
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    <label htmlFor="sameAddress" className="text-sm text-gray-700">
                                        Same as Current Address
                                    </label>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 mb-5">Permanent Address</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="street" className="text-sm font-medium text-gray-700">Street Name</label>
                                    <Field type="text" name="street" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="street" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                                <div>
                                    <label htmlFor="thaluk" className="text-sm font-medium text-gray-700">
                                        Thaluk
                                    </label>
                                    <select
                                        id="thaluk"
                                        name="thaluk"
                                        value={values.thaluk}
                                        onChange={(e) => setFieldValue("thaluk", e.target.value)}
                                        className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-300 focus:ring-opacity-50"
                                    >
                                        <option value="" disabled>Select Thaluk</option>
                                        {filteredThaluk.map((thaluk) => (
                                            <option key={thaluk.id} value={thaluk.id}>
                                                {thaluk.name}
                                            </option>
                                        ))}
                                    </select>
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
                                    <select
                                        id="district"
                                        name="district"
                                        value={values.district}
                                        onChange={(e) => setFieldValue("district", e.target.value)}
                                        className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-300 focus:ring-opacity-50"
                                    >
                                        <option value="">Select District</option>
                                        {filteredDistricts.map((district) => (
                                            <option key={district.id} value={district.id}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
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
                                    <select
                                        id="state"
                                        name="state"
                                        value={values.state}
                                        onChange={(e) => setFieldValue("state", e.target.value)}
                                        className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-300 focus:ring-opacity-50"
                                    >
                                        <option value="">Select State</option>
                                        {filteredState.map((state) => (
                                            <option key={state.id} value={state.id}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ErrorMessage
                                        name="state"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="pincode" className="text-sm font-medium text-gray-700">Pincode</label>
                                    <Field type="text" name="pincode" className="p-2 w-full rounded-md border-gray-300 shadow-sm" />
                                    <ErrorMessage name="pincode" component="div" className="text-red-500 text-sm my-1" />
                                </div>
                                <div>
                                    <label htmlFor="ownerStatus" className="text-sm font-medium text-gray-700">Owner Status</label>
                                    <Field 
                                        as="select" 
                                        name="ownerStatus" 
                                        className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                                        onChange={(e) => {
                                            setFieldValue("ownerStatus", e.target.value);
                                            if (e.target.value !== 'Blocked') {
                                                setFieldValue("blockedReason", "");
                                            }
                                        }}
                                    >
                                        <option value="">Select status</option>
                                        <option value="Active">Active</option>
                                        <option value="InActive">In_Active</option>
                                        <option value="Blocked">Blocked</option>
                                    </Field>
                                    <ErrorMessage name="ownerStatus" component="div" className="text-red-500 text-sm" />
                                    {values.ownerStatus === 'Blocked' && (
                                        <div className="mt-2">
                                            <label htmlFor="blockedReason" className="text-sm font-medium text-gray-700">Block Reason</label>
                                            <Field
                                                type="text"
                                                id="blockedReason"
                                                name="blockedReason"
                                                className="p-2 w-full rounded-md border-gray-300 shadow-sm"
                                            />
                                            <ErrorMessage name="blockedReason" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        )}
                        {isCabStep && (
                            <div className="mt-2 mb-4">
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <Typography variant="h3" className="text-2xl font-bold text-blue-gray-800">
                                        Cab Details
                                    </Typography>
                                    <Button
                                        type="button"
                                        className="bg-primary"
                                        onClick={() =>
                                            navigate('/dashboard/vendors/account/allVehicles/add', {
                                                state: {
                                                    ownerName: accountVal?.name || '',
                                                    type: accountVal?.type || '',
                                                    accountId: accountVal?.id,
                                                    returnTo: `/dashboard/vendors/account/edit/${id}?step=cab`,
                                                },
                                            })
                                        }
                                    >
                                        Add New Cab
                                    </Button>
                                </div>
                                <Card>
                                    <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
                                        {accountVal?.Cabs?.length > 0 ? (
                                            <table className="w-full min-w-[640px] table-auto">
                                                <thead>
                                                    <tr>
                                                        {["Cab ID", "Cab Name", "Cab Number", "Details", "Edit"].map((el, index) => (
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
                                                    {accountVal?.Cabs?.map((cab, key) => {
                                                        const className = `py-3 px-5 ${key === accountVal.Cabs.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                                                        return (
                                                            <tr key={cab?.id}>
                                                                <td className={className}>
                                                                    <Typography className="text-xs font-semibold text-blue-gray-600">{cab?.id}</Typography>
                                                                </td>
                                                                <td className={className}>
                                                                    <Typography className="text-xs font-semibold text-blue-gray-600">{cab?.name || "-"}</Typography>
                                                                </td>
                                                                <td className={className}>
                                                                    <Typography className="text-xs font-semibold text-blue-gray-600">{cab?.car_number || "-"}</Typography>
                                                                </td>
                                                                <td className={className}>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        className="bg-white text-black border border-black px-3 py-1"
                                                                        onClick={() =>
                                                                            navigate(`/dashboard/vendors/account/allVehicles/details/${cab?.id}`, {
                                                                                state: { returnTo: `/dashboard/vendors/account/edit/${id}?step=cab` },
                                                                            })
                                                                        }
                                                                    >
                                                                        Details
                                                                    </Button>
                                                                </td>
                                                                <td className={className}>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        className="bg-primary px-3 py-1"
                                                                        onClick={() =>
                                                                            navigate(`/dashboard/vendors/account/allVehicles/edit/${cab?.id}`, {
                                                                                state: { returnTo: `/dashboard/vendors/account/edit/${id}?step=cab` },
                                                                            })
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <Typography className="px-5 py-3 text-sm text-blue-gray-500">No cabs added yet.</Typography>
                                        )}
                                    </CardBody>
                                </Card>
                            </div>
                        )}
                        <div className="mt-6">
                            <div className="flex flex-row items-center justify-between px-2 mb-2">
                                <Typography variant="h3" className="text-2xl font-bold text-blue-gray-800">
                                    {isAccountStep ? 'Account Documents' : isCabStep ? 'Documents' : 'Review'}
                                </Typography>
                            </div>
                            <Card>
                                <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
                                    <table className="w-full min-w-[640px] table-auto">
                                        <thead>
                                            <tr>
                                                {["Type", "KYC Status", "Created At", "Verfied By", "Verified At", "Action", "View Details"].map((el, index) => (
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
                                            {isAccountStep && (
                                                <>
                                                    <DocumentUpload
                                                        label="Aadhaar Image"
                                                        value={imagePreviews.aadhaarImage?.image1}
                                                        status={getNormalizedDocStatus(imagePreviews.aadhaarImage)}
                                                        name="aadhaarImage"
                                                        onChange={(e) => handleImageUpload(e, setFieldValue, "aadhaarImage", imagePreviews?.aadhaarImage?.id)}
                                                        setModalData={setModalData}
                                                        fullDocVal={imagePreviews.aadhaarImage}
                                                    />
                                                    <DocumentUpload
                                                        label="Live Photo"
                                                        value={imagePreviews.livePhoto?.image1}
                                                        status={getNormalizedDocStatus(imagePreviews.livePhoto)}
                                                        name="livePhoto"
                                                        onChange={(e) => handlePhotoUpload(e, setFieldValue, "livePhoto", imagePreviews?.livePhoto?.id)}
                                                        setModalData={setModalData}
                                                        fullDocVal={imagePreviews.livePhoto}
                                                    />
                                                </>
                                            )}
                                            {isCabStep && (
                                                <>
                                                    <DocumentUpload
                                                        label="License"
                                                        value={imagePreviews?.drivingLicenseImage?.image1}
                                                        status={getNormalizedDocStatus(imagePreviews?.drivingLicenseImage)}
                                                        name="drivingLicenseImage"
                                                        onChange={(e) => handleImageUpload(e, setFieldValue, "drivingLicenseImage", imagePreviews?.drivingLicenseImage?.id)}
                                                        setModalData={setModalData}
                                                        fullDocVal={imagePreviews.drivingLicenseImage}
                                                    />
                                                    <DocumentUpload
                                                        label="RC Copy"
                                                        value={imagePreviews?.rcImage?.image1}
                                                        status={getNormalizedDocStatus(imagePreviews?.rcImage)}
                                                        name="rcImage"
                                                        onChange={(e) => handleImageUpload(e, setFieldValue, "rcImage", imagePreviews?.rcImage?.id)}
                                                        setModalData={setModalData}
                                                        fullDocVal={imagePreviews.rcImage}
                                                    />
                                                    <DocumentUpload
                                                        label="Vehicle Photo"
                                                        value={imagePreviews?.vehiclePhotoImage?.image1}
                                                        status={getNormalizedDocStatus(imagePreviews?.vehiclePhotoImage)}
                                                        name="vehiclePhotoImage"
                                                        onChange={(e) => handleImageUpload(e, setFieldValue, "vehiclePhotoImage", imagePreviews?.vehiclePhotoImage?.id)}
                                                        setModalData={setModalData}
                                                        fullDocVal={imagePreviews.vehiclePhotoImage}
                                                    />
                                                    <DocumentUpload
                                                        label="Insurance Image"
                                                        value={imagePreviews?.insurranceImage?.image1}
                                                        status={getNormalizedDocStatus(imagePreviews?.insurranceImage)}
                                                        name="insurranceImage"
                                                        onChange={(e) => handleImageUpload(e, setFieldValue, "insurranceImage", imagePreviews?.insurranceImage?.id)}
                                                        setModalData={setModalData}
                                                        fullDocVal={imagePreviews.insurranceImage}
                                                    />
                                                    <DocumentUpload
                                                        label="Permit Image"
                                                        value={imagePreviews?.permitImage?.image1}
                                                        status={getNormalizedDocStatus(imagePreviews?.permitImage)}
                                                        name="permitImage"
                                                        onChange={(e) => handleImageUpload(e, setFieldValue, "permitImage", imagePreviews?.permitImage?.id)}
                                                        setModalData={setModalData}
                                                        fullDocVal={imagePreviews.permitImage}
                                                    />
                                                </>
                                            )}
                                            {isReviewStep && (
                                                <>
                                                    <DocumentStatusRow
                                                        label="Aadhaar Image"
                                                        status={getNormalizedDocStatus(imagePreviews.aadhaarImage)}
                                                        fullDocVal={imagePreviews.aadhaarImage}
                                                        setModalData={setModalData}
                                                    />
                                                    <DocumentStatusRow
                                                        label="Live Photo"
                                                        status={getNormalizedDocStatus(imagePreviews.livePhoto)}
                                                        fullDocVal={imagePreviews.livePhoto}
                                                        setModalData={setModalData}
                                                    />
                                                    <DocumentStatusRow
                                                        label="License"
                                                        status={getNormalizedDocStatus(imagePreviews?.drivingLicenseImage)}
                                                        fullDocVal={imagePreviews.drivingLicenseImage}
                                                        setModalData={setModalData}
                                                    />
                                                    <DocumentStatusRow
                                                        label="RC Copy"
                                                        status={getNormalizedDocStatus(imagePreviews?.rcImage)}
                                                        fullDocVal={imagePreviews.rcImage}
                                                        setModalData={setModalData}
                                                    />
                                                    <DocumentStatusRow
                                                        label="Vehicle Photo"
                                                        status={getNormalizedDocStatus(imagePreviews?.vehiclePhotoImage)}
                                                        fullDocVal={imagePreviews.vehiclePhotoImage}
                                                        setModalData={setModalData}
                                                    />
                                                    <DocumentStatusRow
                                                        label="Insurance Image"
                                                        status={getNormalizedDocStatus(imagePreviews?.insurranceImage)}
                                                        fullDocVal={imagePreviews.insurranceImage}
                                                        setModalData={setModalData}
                                                    />
                                                    <DocumentStatusRow
                                                        label="Permit Image"
                                                        status={getNormalizedDocStatus(imagePreviews?.permitImage)}
                                                        fullDocVal={imagePreviews.permitImage}
                                                        setModalData={setModalData}
                                                    />
                                                </>
                                            )}

                                        </tbody>
                                    </table>
                                </CardBody>
                            </Card>
                        </div>
                        <div className='flex flex-row'>
                            <Button
                                fullWidth
                                onClick={() => { navigate('/dashboard/vendors/account'); }}
                                className={`my-6 mx-2 ${ColorStyles.backButton}`}
                            >
                                Back
                            </Button>
                            <Button
                                fullWidth
                                color="blue"
                                onClick={handleSubmit}
                                // disabled={!dirty || !isValid}
                                className='my-6 mx-2'
                            >
                                Update
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
                        <div className="flex flex-col items-center space-y-3">
                            <div className={`flex ${modalData.image2 ? "flex-row space-x-6" : "flex-col"} justify-center`}>
                                {modalData.image && (
                                    <iframe
                                        src={modalData.image}
                                        className="w-full rounded-lg shadow-md"
                                        style={{ height: "45vh", width: "45%" }}
                                    />
                                )}
                                {modalData.image2 && (
                                    <iframe
                                        src={modalData.image2}
                                        className="rounded-lg shadow-md"
                                        style={{ height: "45vh", width: "45%" }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex justify-center mt-4">
                            <a
                                href={modalData.image}
                                download
                                target='_blank'
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
                            >
                                Download Image 1
                            </a>
                            {modalData.image2 && (
                                <a
                                    href={modalData.image2}
                                    download
                                    target="_blank"
                                    className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
                                >
                                    Download Image 2
                                </a>
                            )}
                        </div>
                        <Typography variant="body1" className="text-gray-600 mt-2">
                            Document Status: <span className={getModalStatusColor(modalData?.status)}>{modalData?.status || "PENDING_UPLOAD"}</span>
                        </Typography>
                        {modalData?.User?.name && (
                            <Typography variant="body1" className="text-gray-600">
                                Verified By: {modalData?.User?.name}
                            </Typography>
                        )}
                    </DialogBody>
                    <DialogFooter className="flex flex-wrap gap-2 justify-center">
                        <Button type="button" className="bg-white text-black border border-black px-4 py-2" onClick={() => handleDocumentStatusChange(modalData?.id, "APPROVED")} disabled={!modalData?.id}>Approve</Button>
                        <Button type="button" className="bg-black text-white px-4 py-2" onClick={() => handleDocumentStatusChange(modalData?.id, "DECLINED")} disabled={!modalData?.id}>Decline</Button>
                        <Button type="button" className="bg-orange-500 text-white px-4 py-2" onClick={() => handleDocumentStatusChange(modalData?.id, "NOT_INTERESTED")} disabled={!modalData?.id}>Not Interested</Button>
                        <Button type="button" className="bg-gray-500 text-white px-4 py-2" onClick={() => handleDocumentStatusChange(modalData?.id, "NO_RESPONSE")} disabled={!modalData?.id}>No Response</Button>
                        <Button type="button" className="bg-red-600 text-white px-4 py-2" onClick={() => handleDocumentStatusChange(modalData?.id, "INVALID")} disabled={!modalData?.id}>Invalid</Button>
                    </DialogFooter>
                </Dialog>
            )}
        </div>
    );
};

export default AccountEdit;
