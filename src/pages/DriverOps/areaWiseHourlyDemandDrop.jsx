import React from "react";
import AreaWiseHourlyDemandAllTripTypes from "./areaWiseHourlyDemandAllTripTypes";

const AreaWiseHourlyDemandDrop = ({ filterParams }) => (
  <AreaWiseHourlyDemandAllTripTypes filterParams={filterParams} serviceType="Drop" />
);

export default AreaWiseHourlyDemandDrop;
