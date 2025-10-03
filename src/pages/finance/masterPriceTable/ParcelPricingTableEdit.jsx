import { useState, useEffect } from "react";
import { themeColors } from '@/theme/colors';
import {
    Button,
    Card,
    CardBody,
    Typography,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input
} from "@material-tailwind/react";
import moment from "moment";
import Swal from "sweetalert2";

const ParcelPricingTableEdit = ({ initialParcelPriceData, onUpdated }) => {
    const [priceData, setPriceData] = useState(initialParcelPriceData);
    const [openModal, setOpenModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [formData, setFormData] = useState({
        pickupFreeKm: 0,
        weightCharge: 0,
        weightFreeKg: 0,
        serviceCharge: 0,
        parcelType: "",
    });

    useEffect(() => {
        setPriceData(initialParcelPriceData);
    }, [initialParcelPriceData]);

    const notifyParent = (newData) => {
        setPriceData(newData);
        if (onUpdated) {
            onUpdated(newData);
        }
    };

    const handleOpenModal = (index = null) => {
        if (index !== null) {
            const entry = priceData[index];
            setIsEditMode(true);
            setSelectedIndex(index);
            setFormData({
                pickupFreeKm: entry.pickupFreeKm || 0,
                weightCharge: entry.weightCharge || 0,
                weightFreeKg: entry.weightFreeKg || 0,
                serviceCharge: entry.serviceCharge || 0,
                parcelType: entry.parcelType || "",
                
            });
        } else {
            setIsEditMode(false);
            setSelectedIndex(null);
            setFormData({
                pickupFreeKm: 0,
                weightCharge: 0,
                weightFreeKg: 0,
                serviceCharge: 0,
                parcelType: "",
            });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setIsEditMode(false);
        setSelectedIndex(null);
    };

 const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const payload = {
            pickupFreeKm: parseFloat(formData.pickupFreeKm) || null,
            weightCharge: parseFloat(formData.weightCharge) || null,
            weightFreeKg: parseFloat(formData.weightFreeKg) || null,
            serviceCharge: parseFloat(formData.serviceCharge) || null,
            parcelType: formData.parcelType || null
        };

        let newData;
        if (isEditMode) {
            newData = priceData.map((item, index) =>
                index === selectedIndex ? payload : item
            );
        } else {
            newData = [...priceData, payload];
        }
        notifyParent(newData);
        handleCloseModal();
    };

    const handleDelete = (index) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this peak hour entry?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: themeColors.danger,
            cancelButtonColor: themeColors.info,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                const newData = priceData.filter((_, i) => i !== index);
                notifyParent(newData);
            }
        });
    };

    return (
        <>
            <div className="flex flex-row justify-between px-2 mb-2 mt-4">
                <h2 className="text-2xl font-bold mb-4">Edit Parcel Price Table</h2>
                <Button
                    className="text-xs font-semibold text-white bg-black px-4 py-2"
                    onClick={() => handleOpenModal()}
                >
                    Add Parcel Price
                </Button>
            </div>
            <Card>
                {priceData && priceData.length > 0 ? (
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr className="bg-primary text-white">
                                    {[
                                        "Pickup Free Km",
                                        "Weight Charge",
                                        "Weight Free Kg",
                                        "Service Charges",
                                        "parcel Type",
                                        "Edit/Delete"
                                    ].map((el, index) => (
                                        <th
                                            key={index}
                                            className="border-b border border-blue-gray-50 py-3 px-5 text-left"
                                        >
                                            <Typography
                                                variant="small"
                                                className="text-[11px] font-bold uppercase text-white"
                                            >
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {priceData.map(
                                    (
                                        {
                                            pickupFreeKm,
                                            weightCharge,
                                            weightFreeKg,
                                            serviceCharge,
                                            parcelType
                                        },
                                        index
                                    ) => {
                                        const className = `py-3 px-5 border ${
                                            index === priceData.length - 1
                                                ? ""
                                                : "border-b border-blue-gray-50"
                                        }`;

                                        return (
                                            <tr key={index}>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {pickupFreeKm}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {weightCharge || 0}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {weightFreeKg || 0}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {serviceCharge || 0}
                                                    </Typography>
                                                </td>
                                                 <td className={className}>
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        {parcelType || '-'}
                                                    </Typography>
                                                </td>
                                                <td className={`${className} space-x-2`}>
                                                    <Button
                                                        className="bg-primary-400 hover:bg-primary-500"
                                                        onClick={() => handleOpenModal(index)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        className="bg-red-400"
                                                        onClick={() => handleDelete(index)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </CardBody>
                ) : (
                    <h2 className="text-lg font-medium p-4">Not Available</h2>
                )}
            </Card>

            <Dialog open={openModal} handler={handleCloseModal}>
                <DialogHeader>{isEditMode ? "Edit Parcel Price" : "Add Parcel Price"}</DialogHeader>
                <DialogBody divider>
                    <div className="grid gap-4">
                        <Input
                            type="number"
                            label="Pickup Free Km"
                            name="pickupFreeKm"
                            value={formData.pickupFreeKm}
                            onChange={handleInputChange}
                        />
                        <Input
                            type="number"
                            label="Weight Charge"
                            name="weightCharge"
                            value={formData.weightCharge}
                            onChange={handleInputChange}
                        />
                        <Input
                            type="number"
                            label="Weight Free Kg"
                            name="weightFreeKg"
                            value={formData.weightFreeKg}
                            onChange={handleInputChange}
                        />
                        <Input
                            type="number"
                            label="Service Charges"
                            name="serviceCharge"
                            value={formData.serviceCharge}
                            onChange={handleInputChange}
                        />
                         <Input
                            type="text"
                            label="Parcel Type"
                            name="parcelType"
                            value={formData.parcelType}
                            onChange={handleInputChange}
                        />
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleCloseModal}
                        className="mr-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="gradient"
                        color="green"
                        onClick={handleSubmit}
                        disabled={!formData.pickupFreeKm || !formData.weightCharge || !formData.weightFreeKg || !formData.serviceCharge}
                    >
                        {isEditMode ? "Update" : "Add"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
};

export default ParcelPricingTableEdit;