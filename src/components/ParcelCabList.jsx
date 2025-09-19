import {Card,CardBody,Typography,Button} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { ColorStyles } from "@/utils/constants";

const ParcelCabList = ({parcelsList, ownerName, type, id}) => {
    const navigate = useNavigate();

    return (
        <>
            <div className='flex flex-row justify-between px-2 mb-2 mt-4'>
                <h2 className="text-2xl font-bold mb-4">Vehicle List</h2>                
                {(type === 'Parcel' && (!parcelsList || parcelsList.length < 1)) && (
                    <div>
                        <Button
                            className={`text-white ${ColorStyles.addButtonColor}`}
                            onClick={() =>
                                navigate('/dashboard/vendors/account/parcel/allVehicles/add', {
                                    state: {
                                        ownerName,
                                        type: 'Parcel',
                                        accountId: id,
                                    },
                                })
                            }
                        >
                            Add new Vehicle
                        </Button>
                    </div>
                )}
            </div>
            <Card>
                {parcelsList && parcelsList?.length > 0 ? (
                    <>
                        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                            <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {[
                                            "Vehicle Name",
                                            "Vehicle Number",
                                            "Vehicle Type",
                                            "Created At",
                                            "Driver Name",
                                            "Insurance Expiry Date",
                                        ].filter((el) => !(type === 'Individual' && el === "Assign/Reassign"))
                                        .map((el, index) => (
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
                                    {parcelsList.map(
                                        ({ id, name, vehicleType, data,vehicleNumber, insurance, Drivers, created_at }, key) => {
                                            const className = `py-3 px-5 ${key === parcelsList.length - 1
                                                    ? ""
                                                    : "border-b border-blue-gray-50"
                                                }`;
                                            return (
                                                <>
                                                    <tr key={id}>
                                                        <td className={className}>
                                                            <Typography 
                                                                className="font-semibold underline cursor-pointer text-blue-900"
                                                                onClick={() => navigate(`/dashboard/vendors/account/parcel/allVehicles/details/${id}`)}
                                                            >
                                                                {name}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                           <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {vehicleNumber}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {vehicleType}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {moment(created_at).format("DD-MM-YYYY")}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {Drivers[0]?.firstName ? Drivers[0]?.firstName : ownerName}
                                                            </Typography>
                                                        </td>
                                                        <td className={className}>
                                                            <Typography className="text-xs font-semibold text-blue-gray-600">
                                                                {moment(insurance).format("DD-MM-YYYY")}
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
                    <h2 className="text-lg font-medium p-4">No Parcel Vehicles</h2>
                )
                }
            </Card>
        </>
    )
};

export default ParcelCabList;