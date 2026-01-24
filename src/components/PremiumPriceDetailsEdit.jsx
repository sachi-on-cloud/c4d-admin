import { useState, useEffect } from "react";
import {Button, Card, CardBody, Typography, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Switch} from "@material-tailwind/react";

const PremiumPriceDetailsEdit = ({ initialPremiumData = {}, onUpdate }) => {
  const [premiumConfig, setPremiumConfig] = useState(initialPremiumData);
  const [open, setOpen] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [formData, setFormData] = useState({
    isPremium: true,
    multiplier: 0.1,
  });

  useEffect(() => {
    setPremiumConfig(initialPremiumData || {});
  }, [initialPremiumData]);


  const handleOpen = (key) => {
    setEditKey(key);
    setFormData({
      isPremium: premiumConfig[key]?.isPremium ?? true,
      multiplier: premiumConfig[key]?.multiplier ?? 1.0,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditKey(null);
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const multiplier = parseFloat(formData.multiplier);
    if (isNaN(multiplier) || multiplier <= 0) return;

    const updatedConfig = {
      ...premiumConfig,
      [editKey]: {
        isPremium: Boolean(formData.isPremium),
        multiplier,
      },
    };

    setPremiumConfig(updatedConfig);
    onUpdate?.(updatedConfig);
    handleClose();
  };

  const hasData = Object.keys(premiumConfig).length > 0;

  return (
    <>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Premium Vehicle Pricing</h2>

        <Card>
          <CardBody className="p-0">
            {hasData ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max table-auto text-left">
                  <thead>
                    <tr className="bg-gray-200 text-black">
                      <th className="px-6 py-3 text-xs font-bold uppercase">Category</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase">Multiplier</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(premiumConfig).map(([category, config]) => (
                      <tr key={category} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {category}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${
                              config.isPremium
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {config.isPremium ? "Active" : "In-Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {config.multiplier}x
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleOpen(category)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Typography variant="h6">
                  No premium available
                </Typography>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Dialog open={open} handler={handleClose} size="sm">
        <DialogHeader>Edit Premium - {editKey}</DialogHeader>
        <DialogBody divider>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Is Premium Vehicle?</span>
              <Switch
                checked={formData.isPremium}
                onChange={(e) => handleChange("isPremium", e.target.checked)}
              />
            </div>

            <Input
              type="number"
              label="Price Multiplier (e.g. 1.2 = +20%)"
              step="0.1"
              min="0.1"
              max="10"
              value={formData.multiplier}
              onChange={(e) => handleChange("multiplier", e.target.value)}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="gray" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="gradient" color="green" onClick={handleSubmit}>
            Update
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default PremiumPriceDetailsEdit;