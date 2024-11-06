import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Alert
} from "@material-tailwind/react";
import CustomerSearch from "@/components/CustomerSearch";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES } from "@/utils/constants";
import { useLocation, useNavigate } from 'react-router-dom';


export function AccountView() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [alert, setAlert] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await ApiRequestUtils.get(API_ROUTES.GET_ALL_CUSTOMERS);
      if (data?.success) {
        setAccounts(data?.data);
        setAllAccounts(data?.data);
      }
    };
    fetchAccounts();

    if (location.state?.accountAdded || location.state?.customerUpdated) {
      const action = location.state.accountAdded ? 'added' : 'updated';
      setAlert({
        message: `${location.state.accountName} ${action} successfully!`
      });
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const getAccounts = async (searchQuery) => {
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();

      const filteredAccounts = allAccounts.filter((account) => {
        const name = (account.firstName || "").toLowerCase();
        const phone = (account.phoneNumber || "").toLowerCase();

        const phoneNumberWithoutCountryCode = phone.startsWith("+91") ? phone.slice(3) : phone;

        return name.startsWith(query) ||
          phoneNumberWithoutCountryCode.startsWith(query);
      });
      setAccounts(filteredAccounts);

    } else {
      setAccounts(allAccounts);
    }
  };

  return (
    <div className="mt-6 mb-8 flex flex-col gap-12">
      {alert && (
        <div className='mb-2'>
          <Alert
            color='blue'
            className='py-3 px-6 rounded-xl'
          >
            {alert.message}
          </Alert>
        </div>)}
      <CustomerSearch onSearch={getAccounts} />
      <Card>
        {accounts.length > 0 ? (
          <>
            <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
              <Typography variant="h6" color="white">
                Accounts List
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Name", "Phone Number", ""].map((el) => (
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
                    ({ id, firstName, lastName, phoneNumber, email }, key) => {
                      const className = `py-3 px-5 ${key === accounts.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;

                      return (
                        <tr key={id}>
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <div onClick={() => navigate(`/dashboard/accounts/details/${id}`)}>
                                <Typography
                                  variant="small"
                                  color="blue"
                                  className="font-semibold underline"
                                >
                                  {firstName}
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <Typography className="text-xs font-semibold text-blue-gray-600">
                              {phoneNumber}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Button
                              as='a'
                              onClick={() => navigate(`/dashboard/accounts/edit/${id}`)}
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
          </>) : (
          <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
            <Typography variant="h6" color="white">
              No Accounts
            </Typography>
          </CardHeader>
        )}
      </Card>
    </div>
  );
}

export default AccountView;
