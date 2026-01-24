import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Spinner,
  Button,
} from "@material-tailwind/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiRequestUtils } from "@/utils/apiRequestUtils";
import { API_ROUTES, ColorStyles } from "@/utils/constants";


const DriverOfferAssign = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [offers, setOffers] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState(
    location.state?.offerId ? String(location.state.offerId) : ""
  );
  const [driverIdsInput, setDriverIdsInput] = useState("");
  const [driverIdsError, setDriverIdsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const offerRes = await ApiRequestUtils.get(API_ROUTES.GET_DRIVER_OFFER);
        console.log("Fetched driver Bonus :", offerRes);
        if (offerRes?.success) {
          const data = Array.isArray(offerRes.data)
            ? offerRes.data
            : offerRes.data
            ? [offerRes.data]
            : [];
          setOffers(data);
          if (!selectedOfferId && data.length > 0) {
            setSelectedOfferId(String(data[0].id));
          }
        } else {
          setOffers([]);
        }
      } catch (error) {
        console.error("Error loading offers:", error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    setDriverIdsError("");

    if (!selectedOfferId) {
      console.error("Offer information is missing.");
      return;
    }

    if (!driverIdsInput.trim()) {
      setDriverIdsError("Enter at least one driver ID Separated by comma  eg: 1,234,");
      return;
    }

    const rawIds = (driverIdsInput || "")
      .split(/[\n,]+/)
      .map((id) => id.trim())
      .filter((id) => id !== "");

    const driverIds = Array.from(
      new Set(
        rawIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      )
    );

    if (driverIds.length === 0) {
      console.error("No valid driver IDs entered.");
      setDriverIdsError("Enter valid numeric driver IDs (e.g. 12, 34).");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        offerId: String(selectedOfferId),
        driverIds,
      };

      const res = await ApiRequestUtils.post(API_ROUTES.POST_DRIVER_OFFER_ASSIGN,payload);

      if (res?.success) {
        navigate("/dashboard/users/driver-offer/list");
      } else if (res?.message) {
        console.error("Failed to assign offer to drivers:", res.message);
      }
    } catch (error) {
      console.error("Error assigning driver Bonus :", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-8 flex flex-col gap-6 mt-8">
      <Card>
        <CardHeader
          variant="gradient"
          className={`mb-4 p-6 rounded-xl ${ColorStyles.bgColor}`}
        >
          <Typography variant="h6" color="white">
            Assign Driver Bonus
          </Typography>
        </CardHeader>
        <CardBody className="pt-0">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spinner className="h-12 w-12" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <Typography variant="small" className="font-medium hidden">
                  Offer ID: {selectedOfferId || "-"}
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Offer
                  </label>
                  <select
                    value={selectedOfferId}
                    onChange={(e) => setSelectedOfferId(e.target.value)}
                    className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm bg-white"
                  >
                    <option value="">Select Offer</option>
                    {offers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.title || "Offer"}
                        {offer.serviceType ? ` - ${offer.serviceType}` : ""}
                        {offer.serviceArea ? ` - ${offer.serviceArea}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Driver IDs
                  </label>
                  <textarea
                    rows={3}
                    value={driverIdsInput}
                    onChange={(e) => {
                      setDriverIdsInput(e.target.value);
                      if (driverIdsError) setDriverIdsError("");
                    }}
                    className="mt-1 p-2 w-full rounded-md border-2 border-gray-300 shadow-sm"
                    placeholder="Enter one or more driver IDs, separated by comma or new line"
                  />
                  {driverIdsError && (
                    <Typography className="text-xs text-red-500 mt-1">
                      {driverIdsError}
                    </Typography>
                  )}
                  {/* <Typography className="text-xs text-gray-500 mt-1">
                    The entered IDs will be sent directly as driverIds.
                  </Typography> */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outlined"
                      className={`px-6 rounded-xl ${ColorStyles.backButton}`}
                      onClick={() =>
                        navigate("/dashboard/users/driver-offer/list")
                      }
                    >
                      Back
                    </Button>
                    <Button
                      className={`px-6 rounded-xl ${ColorStyles.continueButtonColor}`}
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Assigning..." : "Assign Offer"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DriverOfferAssign;
