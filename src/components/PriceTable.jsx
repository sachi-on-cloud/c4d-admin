import React, { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip,
    Button,
    Alert
} from "@material-tailwind/react";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import PriceAdd from './AddPriceTable';

function PriceTable({ driverId, packages, selectedPackages }) {
    console.log("selectedPackages", selectedPackages);
    const [rows, setRows] = useState([]);
    const [newRow, setNewRow] = useState({ name: '', age: '' });
    const [price, setPrice] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const getPrice = async (driverId) => {

        const data = await ApiRequestUtils.get(API_ROUTES.GET_PRICE + `?driverId=${driverId}`);
        if (data?.success) {
            setPrice(data?.data);
        }
    };
    const showPrice = () => {
        setShowForm(!showForm)
    }
    useEffect(() => {
        getPrice(driverId);
    }, [])
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRow({ ...newRow, [name]: value });
    };

    const handleAddRow = (e) => {
        e.preventDefault();
        setRows([...rows, newRow]);
        setNewRow({ name: '', age: '' });
    };

    return (
        <div>
            <Card>
                {price.length > 0 ? (
                    <>
                        <br /><br />
                        <h2 className="text-2xl font-bold mb-4">Price Details

                            <button type="button" onClick={showPrice}>Add Row</button>
                        </h2>
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {["Package", "Price", "Extra Price", "Extra KM Price", "Night Charge", "Cancel Charge", "Cab Type", ""].map((el) => (
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
                                    {price.map(
                                        ({ id, packageId, price, extraPrice, extraKmPrice, nightCharge, cancelCharge, extraCabType }, key) => {
                                            const className = `py-3 px-5 ${key === price.length - 1
                                                ? ""
                                                : "border-b border-blue-gray-50"
                                                }`;

                                            return (
                                                <tr key={id}>
                                                    <td className={className}>
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <Typography
                                                                    variant="small"
                                                                    color="blue-gray"
                                                                    className="font-semibold"
                                                                >
                                                                    {packageId}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {price}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {extraPrice}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {extraKmPrice}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {nightCharge}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {cancelCharge}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                                            {extraCabType}
                                                        </Typography>
                                                    </td>
                                                    <td className={className}>
                                                        <Button
                                                            as="a"
                                                            onClick={() => { alert("hi"); }}
                                                            className="text-xs font-semibold text-white"
                                                        >
                                                            Edit
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </CardBody>

                    </>) : (<>
                        <br />
                        <h2 className="text-2xl font-bold mb-4 ml-4">No Price Record
                            <button type="button" onClick={showPrice}> Add Row</button>
                        </h2>
                    </>
                )}
            </Card>

            {showForm &&
                <PriceAdd driverId={driverId} packages={packages} selectedPackages={selectedPackages} />
            }
        </div>
    );
}

export default PriceTable;