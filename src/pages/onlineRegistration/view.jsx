import AccountSearch from "@/components/AccountSearch";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
  } from "@material-tailwind/react";

export function OnlineRegistrationView(){
    const [accounts, setAccounts] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);

    useEffect(()=>{
        const fetchData = async ()=> {
            const data = await ApiRequestUtils.get(API_ROUTES.GET_ONLINE_REGISTER_DETAILS);
            console.log("DTATTATTATTTTATTAA",data)
            if(data?.success){
                setAccounts(data?.document);
                setAllAccounts(data?.document);
            }
        }
        fetchData();
    },[])

    const getDeatils = async (searchQuery) => {
        if (searchQuery && searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase().trim();
            const filteredAccounts = allAccounts.filter((acc) => {
            const name = (acc.firstName || "").toLowerCase();
            const phone = (acc.phoneNumber || "").toLowerCase();
            const phoneNumberWithoutCountryCode = phone.startsWith("+91") ? phone.slice(3) : phone;
            return (
                name.startsWith(query) || 
                phone.startsWith(query) || 
                phoneNumberWithoutCountryCode.startsWith(query)
            );
          });
          setAccounts(filteredAccounts);
        } else {
          setAccounts(allAccounts);
        }
    };

    return (    
        <div className="mt-6 mb-8 flex flex-col gap-12">
            <AccountSearch onSearch={getDeatils} addAccBtn={false} />
            <Card>
                {accounts.length > 0  ? (
                <>
                    <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex-1 justify-between items-center">
                    <Typography variant="h6" color="white">
                        Accounts List
                    </Typography>
                    </CardHeader>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                            {["Name", "Phone Number", "KYC Documents", ""].map((el) => (
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
                            {accounts.map(({ id, firstName, phoneNumber, documents }, key) => {
                            const className = `py-3 px-5 ${
                                key === accounts.length - 1 ? "" : "border-b border-blue-gray-50"
                            }`;

                            return (
                                <tr key={id}>
                                <td className={className}>
                                    <div className="flex items-center gap-4">
                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                        {firstName}
                                    </Typography>
                                    </div>
                                </td>
                                <td className={className}>
                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                    {phoneNumber}
                                    </Typography>
                                </td>
                                <td className={className}>
                                    <div className="flex flex-col space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                        LICENSE
                                        </Typography>
                                        <Typography
                                        className={`text-xs font-semibold ${
                                            documents.LICENSE === "APPROVED"
                                            ? "text-green-500"
                                            : documents.LICENSE === "PENDING"
                                            ? "text-yellow-500"
                                            : documents.LICENSE === "DECLINED"
                                            ? "text-red-500"
                                            : "text-gray-500"
                                        }`}
                                        >
                                        {documents.LICENSE}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                        AADHAAR
                                        </Typography>
                                        <Typography
                                        className={`text-xs font-semibold ${
                                            documents.AADHAAR === "APPROVED"
                                            ? "text-green-500"
                                            : documents.AADHAAR === "PENDING"
                                            ? "text-yellow-500"
                                            : documents.AADHAAR === "DECLINED"
                                            ? "text-red-500"
                                            : "text-gray-500"
                                        }`}
                                        >
                                        {documents.AADHAAR}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                        RC COPY
                                        </Typography>
                                        <Typography
                                        className={`text-xs font-semibold ${
                                            documents.RC_COPY === "APPROVED"
                                            ? "text-green-500"
                                            : documents.RC_COPY === "PENDING"
                                            ? "text-yellow-500"
                                            : documents.RC_COPY === "DECLINED"
                                            ? "text-red-500"
                                            : "text-gray-500"
                                        }`}
                                        >
                                        {documents.RC_COPY}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                        PHOTO
                                        </Typography>
                                        <Typography
                                        className={`text-xs font-semibold ${
                                            documents.PHOTO === "APPROVED"
                                            ? "text-green-500"
                                            : documents.PHOTO === "PENDING"
                                            ? "text-yellow-500"
                                            : documents.PHOTO === "DECLINED"
                                            ? "text-red-500"
                                            : "text-gray-500"
                                        }`}
                                        >
                                        {documents.PHOTO}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                        PAN
                                        </Typography>
                                        <Typography
                                        className={`text-xs font-semibold ${
                                            documents.PAN === "APPROVED"
                                            ? "text-green-500"
                                            : documents.PAN === "PENDING"
                                            ? "text-yellow-500"
                                            : documents.PAN === "DECLINED"
                                            ? "text-red-500"
                                            : "text-gray-500"
                                        }`}
                                        >
                                        {documents.PAN}
                                        </Typography>
                                    </div>
                                    </div>
                                </td>
                                <td className={className}>
                                    {
                                        documents.PAN === "APPROVED" &&
                                        documents.PHOTO === "APPROVED" &&
                                        documents.AADHAAR === "APPROVED" &&
                                        (documents.LICENSE === "APPROVED" || documents.RC_COPY === "APPROVED") && (
                                        <>
                                            <Button
                                            as="a"
                                            className="mr-5 text-xs font-semibold text-black bg-white border border-black"
                                            >
                                            Create Driver
                                            </Button>
                                            <Button as="a" className="text-xs font-semibold text-white">
                                            Create Owner
                                            </Button>
                                        </>
                                    )}
                                </td>
                                </tr>
                            );
                            })}
                        </tbody>
                        </table>
                    </CardBody>
                </>) : (
                <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
                    <Typography variant="h6" color="white">
                    No Accounts
                    </Typography>
                </CardHeader>
                )}
            </Card>
        </div>        
    )
}