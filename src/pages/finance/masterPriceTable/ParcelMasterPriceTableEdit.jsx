import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ApiRequestUtils } from '@/utils/apiRequestUtils';
import { API_ROUTES, ColorStyles } from '@/utils/constants';
import { Button, Card, CardBody, Typography, Dialog, DialogHeader, DialogBody, DialogFooter, Input, IconButton, Chip, Switch} from "@material-tailwind/react";
import { PencilIcon } from "@heroicons/react/24/solid";
import MasterPriceLogParcel from "../masterPriceTable/MasterPriceLogParcel";

const safeTier = {
    parcelType: "",
    baseFare: 0,
    baseKm: 0,
    pickupFreeKm: 0,
    distanceSlabs: [],
    weightSurcharge: [],
    peakSurcharge: [],
    weatherSurcharge: [{ status: 'INACTIVE', amount: 0 }],
    handlingSurcharge: [{ status: 'INACTIVE', amount: 0 }],
    nightCharge: 0,
    nightHoursFrom: "00:00",
    nightHoursTo: "00:00",
};

export default function ParcelPricingTableEdit({ onUpdated }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [priceData, setPriceData] = useState([]);
    const [zone, setZone] = useState("");
    const [saving, setSaving] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [formData, setFormData] = useState(safeTier);

    useEffect(() => {
        if (!id) return;
        const fetchPriceDetails = async () => {
            try {
                const data = await ApiRequestUtils.get(`${API_ROUTES.RIDES_PRICE_DETAILS}/${id}`);
                if (data?.success) {
                    setZone(data?.data?.zone || "");
                    const rawPricing = data?.data?.parcelPricing || [];

                    const mapped = rawPricing.map(tier => ({ ...safeTier,
                        parcelType: tier.parcelType || '',
                        baseFare: Number(tier.baseFare) || 0,
                        baseKm: Number(tier.baseKm) || 0,
                        pickupFreeKm: Number(tier.pickupFreeKm) || 0,
                        distanceSlabs: (() => {
                            const slabs = tier.distanceSlabs || [];
                            const two = [ 
                                slabs[0] || { maxKm: 0, ratePerKm: 0 },
                                slabs[1] || { maxKm: null, ratePerKm: 0 },
                            ];
                            return two.map(s => ({
                                maxKm: s.maxKm === null || s.maxKm === '' ? null : Number(s.maxKm),
                                ratePerKm: Number(s.ratePerKm) || 0,
                            }));
                        })(),
                        weightSurcharge: (tier.weightSurcharge || []).map(w => ({
                            minKg: Number(w.minKg) || 0,
                            maxKg: Number(w.maxKg) || 0,
                            amount: Number(w.amount) || 0,
                        })),
                        peakSurcharge: (tier.peakSurcharge || []).map(p => {
                            const slabs = p.slabs || [];
                            const normalizedSlabs = [
                                slabs[0] || { maxKm: 0, amountPerKm: 0 },
                                slabs[1] || { maxKm: null, amountPerKm: 0 }
                            ];

                            return {
                                isActive: !!p.isActive,
                                start: p.start || '00:00',
                                end: p.end || '00:00',
                                slabs: normalizedSlabs.map(ps => ({
                                    maxKm: ps.maxKm === '' ? null : Number(ps.maxKm),
                                    amountPerKm: Number(ps.amountPerKm) || 0,
                                })),
                            };
                        }),
                        weatherSurcharge: Array.isArray(tier.weatherSurcharge)
                            ? tier.weatherSurcharge.map(ws => ({
                                status: ws.status || 'INACTIVE',
                                amount: Number(ws.amount) || 0
                            }))
                            : [{ status: 'INACTIVE', amount: 0 }],
                        handlingSurcharge: Array.isArray(tier.handlingSurcharge)
                            ? tier.handlingSurcharge.map(hs => ({
                                status: hs.status || 'INACTIVE',
                                amount: Number(hs.amount) || 0
                            }))
                            : [{ status: 'INACTIVE', amount: 0 }],
                        nightCharge: Number(tier.nightCharge) || 0,
                        nightHoursFrom: tier.nightHoursFrom || '00:00',
                        nightHoursTo: tier.nightHoursTo || '00:00',
                    }));
                    setPriceData(mapped);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };
        fetchPriceDetails();
    }, [id]);

    const notify = (data) => {
        setPriceData(data);
        onUpdated?.(data);
    };

    const handleOpenModal = (idx) => {
        setIsEditMode(true);
        setSelectedIndex(idx);
        setFormData({ ...priceData[idx] });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setIsEditMode(false);
        setSelectedIndex(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const updateSlab = (key, i, field, val) =>
        setFormData(p => ({
            ...p,
            [key]: p[key].map((s, j) =>
                j === i
                    ? {
                        ...s,
                        [field]: field === "maxKm" && val === ""
                            ? null
                            : parseFloat(val) || val,
                    }
                    : s
            ),
        }));

    const handleSubmit = () => {
        if (!formData.parcelType?.trim() || formData.baseFare <= 0) {
            console.warn("Oops", "Parcel Type & Base Fare required", "error");
            return null;
        }

        const newData = priceData.map((x, i) => (i === selectedIndex ? formData : x));
        notify(newData);
        handleCloseModal();
        return newData;
    };
    const peakUpdateSlab = (field, index, subPath, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const list = [...(newData[field] || [])];

            if (!list[index]) {
                list[index] = {
                    isActive: false,
                    start: "00:00",
                    end: "00:00",
                    slabs: [{ maxKm: 0, amountPerKm: 0 }, { maxKm: null, amountPerKm: 0 }]
                };
            }

            const item = { ...list[index] };

            if (subPath.includes('.')) {
                const parts = subPath.split('.');
                let parent = parts[0];
                let child = parts[1];
                let slabIdx = null;

                if (parent === 'slabs' && slabIdx !== null) {
                    const slabs = [...(item.slabs || [])];
                    if (!slabs[slabIdx]) {
                        slabs[slabIdx] = { maxKm: (slabIdx === 1 ? null : 0), amountPerKm: 0 };
                    }
                    slabs[slabIdx] = { ...slabs[slabIdx], [child]: value };
                    item.slabs = slabs;
                } else {
                    item[subPath] = value;
                }
            } else {
                item[subPath] = value;
            }

            list[index] = item;
            newData[field] = list;
            return newData;
        });
    };

    const onSubmit = async (dataOverride = null) => {
        try {
            setSaving(true);
            const source = Array.isArray(dataOverride) ? dataOverride : priceData;
            const parcelPricing = source.map(t => {
                const wsArr = Array.isArray(t.weatherSurcharge) && t.weatherSurcharge.length
                    ? t.weatherSurcharge
                    : [{ status: 'INACTIVE', amount: 0 }];
                const hsArr = Array.isArray(t.handlingSurcharge) && t.handlingSurcharge.length
                    ? t.handlingSurcharge
                    : [{ status: 'INACTIVE', amount: 0 }];
                return ({
                    parcelType: t.parcelType,
                    baseFare: Number(t.baseFare),
                    baseKm: Number(t.baseKm),
                    pickupFreeKm: Number(t.pickupFreeKm),
                    distanceSlabs: (t.distanceSlabs || []).map(s => ({
                        maxKm: s.maxKm === null ? null : Number(s.maxKm),
                        ratePerKm: Number(s.ratePerKm),
                    })),
                    weightSurcharge: (t.weightSurcharge || []).map(w => ({
                        minKg: Number(w.minKg),
                        maxKg: Number(w.maxKg),
                        amount: Number(w.amount),
                    })),
                    peakSurcharge: (t.peakSurcharge || []).map(p => ({
                        isActive: !!p.isActive,
                        start: p.start,
                        end: p.end,
                        slabs: (p.slabs || []).map(ps => ({
                            maxKm: ps.maxKm === null ? null : Number(ps.maxKm),
                            amountPerKm: Number(ps.amountPerKm),
                        })),
                    })),
                    weatherSurcharge: wsArr.map(ws => ({
                        status: ws.status || 'INACTIVE',
                        amount: Number(ws.amount),
                    })),
                    handlingSurcharge: hsArr.map(hs => ({
                        status: hs.status || 'INACTIVE',
                        amount: Number(hs.amount),
                    })),
                    nightCharge: Number(t.nightCharge),
                    nightHoursFrom: t.nightHoursFrom,
                    nightHoursTo: t.nightHoursTo,
                });
            });

            const reqBody = { packageId: Number(id), parcelPricing };

            let response = await ApiRequestUtils.post(API_ROUTES.PARCEL_PRICE_EDIT, reqBody);
            if (!response?.success) {
                response = await ApiRequestUtils.update(API_ROUTES.PARCEL_PRICE_EDIT, reqBody);
            }

            if (response?.success) {
                navigate('/dashboard/finance/master-price');
            } else {
                console.warn('Error', response?.message || 'Update failed', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            console.warn('Error', 'Network or server error', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAndSubmit = () => {
        const newData = selectedIndex !== null
            ? priceData.map((x, i) => (i === selectedIndex ? formData : x))
            : priceData;
        onSubmit(newData);
        handleCloseModal();
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex items-center gap-3">
                    <Typography variant="h4" className="font-bold">
                        Parcel Pricing Tiers
                    </Typography>
                    {zone && ( <span className="px-2 py-1 text-xs rounded bg-gray-100 border"> Zone: {zone} </span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {priceData.length ? (
                    priceData.map((tier, i) => (
                        <Card key={i} className="shadow hover:shadow-xl transition">
                            <CardBody>
                                <div className="flex justify-between items-start mb-3">
                                    <Typography variant="h6" className="font-bold text-blue-700">
                                        {tier.parcelType || "Unnamed"}
                                    </Typography>
                                    <IconButton size="sm" color="blue" onClick={() => handleOpenModal(i)}>
                                        <PencilIcon className="h-4 w-4" />
                                    </IconButton>
                                </div>

                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Base:</span>
                                        <span>₹{tier.baseFare}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Base KM:</span>
                                        <span>{tier.baseKm}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Night Charge:</span>
                                        <span>{tier.nightCharge}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Pick Up Free KM:</span>
                                        <span>{tier.pickupFreeKm}</span>
                                    </div>

                                    <div className="font-medium">Distance Slab:</div>
                                    {tier.distanceSlabs.map((slab, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                {idx === 0 ? `< ${slab.maxKm} km` : `> ${tier.distanceSlabs[0].maxKm} km`}
                                            </span>
                                            <span className="font-semibold text-green-600">
                                                ₹{slab.ratePerKm}/km
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 flex flex-wrap gap-1">
                                    {tier.distanceSlabs.some(s => s.maxKm > 0) && <Chip size="sm" color="orange" value="Distance" />}
                                    {tier.weightSurcharge.some(w => w.amount > 0) && <Chip size="sm" color="red" value="Weight" />}
                                    {tier.peakSurcharge.some(p => p.isActive) && <Chip size="sm" color="green" value="Peak" />}
                                    {tier.weatherSurcharge.some(w => w.status === "ACTIVE") && <Chip size="sm" color="blue" value="Weather" />}
                                    {tier.handlingSurcharge.some(h => h.status === "ACTIVE") && <Chip size="sm" color="amber" value="Handling" />}
                                </div>
                            </CardBody>
                        </Card>
                    ))
                ) : (
                    <Card className="col-span-full">
                        <CardBody className="text-center py-12">
                            <Typography color="gray">No tiers yet.</Typography>
                        </CardBody>
                    </Card>
                )}
            </div>

            <Dialog open={openModal} handler={handleCloseModal} size="xl">
                <DialogHeader className="justify-between">
                    <Typography variant="h5">
                        {isEditMode ? "Edit" : "Add"} Parcel Tier
                    </Typography>
                    <IconButton variant="text" onClick={handleCloseModal}>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </IconButton>
                </DialogHeader>

                <DialogBody className="max-h-[70vh] overflow-y-auto">
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <Input label="Parcel Type" name="parcelType" value={formData.parcelType} onChange={handleInputChange} />
                        <Input type="number" label="Base Fare ₹" value={formData.baseFare}
                            onChange={e => setFormData(p => ({ ...p, baseFare: isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber }))}
                        />
                        <Input type="number" label="Base Km" value={formData.baseKm}
                            onChange={e => setFormData(p => ({ ...p, baseKm: isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber }))}
                        />
                        <Input type="number" label="Free Pickup Km" value={formData.pickupFreeKm}
                            onChange={e => setFormData(p => ({ ...p, pickupFreeKm: isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber }))}
                        />
                        <Input type="number" label="Night Charge ₹" value={formData.nightCharge}
                            onChange={e => setFormData(p => ({ ...p, nightCharge: isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber }))}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1">Night From</label>
                                <input type="time" name="nightHoursFrom" value={formData.nightHoursFrom} onChange={handleInputChange} className="border rounded px-3 py-2 text-sm w-full" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-1">Night To</label>
                                <input type="time" name="nightHoursTo" value={formData.nightHoursTo} onChange={handleInputChange} className="border rounded px-3 py-2 text-sm w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border rounded space-y-3 mb-4">
                        <div className="font-medium text-gray-700">Distance Slabs</div>
                        {(formData.distanceSlabs || []).slice(0, 2).map((s, i) => {
                            const isSecond = i === 1;
                            const maxKmValue = isSecond ? "" : s.maxKm || "";
                            const placeholder = isSecond ? `Above ${formData.distanceSlabs[0]?.maxKm || ""} km` : "";
                            return (
                                <div key={i} className="flex gap-3 items-end">
                                    <Input label="Max Km" value={maxKmValue} placeholder={placeholder} disabled={isSecond}
                                        onChange={e => updateSlab("distanceSlabs", i, "maxKm", e.target.value)}
                                        labelProps={{ className: isSecond ? "hidden" : "" }}
                                    />
                                    <Input type="number" label="₹/km" value={s.ratePerKm}
                                        onChange={e => updateSlab("distanceSlabs", i, "ratePerKm", isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 border rounded-lg mb-4">
                        <div className="font-medium mb-2">Weight Surcharge</div>
                        {(() => {
                            const s = (formData.weightSurcharge || [])[0] || { minKg: 0, maxKg: 0, amount: 0 };
                            return (
                                <div className="flex gap-3">
                                    <Input type="number" label="Min Kg" value={s.minKg} onChange={e => updateSlab("weightSurcharge", 0, "minKg", isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)} />
                                    <Input type="number" label="Max Kg" value={s.maxKg} onChange={e => updateSlab("weightSurcharge", 0, "maxKg", isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)} />
                                    <Input type="number" label="Amount ₹" value={s.amount} onChange={e => updateSlab("weightSurcharge", 0, "amount", isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)} />
                                </div>
                            );
                        })()}
                    </div>

                    <div className="p-4 border rounded-lg mb-4">
                        <div className="font-medium mb-2">Peak Surcharge</div>
                        {(() => {
                            const peakList = formData.peakSurcharge || [];
                            const peak = peakList[0] || {
                                isActive: false,
                                start: "00:00",
                                end: "00:00",
                                slabs: [
                                    { maxKm: 0, amountPerKm: 0 },
                                    { maxKm: null, amountPerKm: 0 }
                                ]
                            };

                            const firstMaxKm = peak.slabs[0]?.maxKm || 0;

                            return (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Typography variant="h6">Peak Slot</Typography>
                                        <div className="flex items-center gap-3">
                                            <Typography variant="small" className="font-medium">Status</Typography>
                                            <Switch
                                                checked={peak.isActive}
                                                onChange={e => peakUpdateSlab("peakSurcharge", 0, "isActive", e.target.checked)}
                                                color="green"
                                            />
                                            <Typography variant="small" className={`font-medium ${peak.isActive ? "text-green-600" : "text-gray-500"}`}>
                                                {peak.isActive ? "Active" : "Inactive"}
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            label="Start Time" type="time" value={peak.start || "00:00"}
                                            onChange={e => peakUpdateSlab("peakSurcharge", 0, "start", e.target.value)}
                                        />
                                        <Input
                                            label="End Time" type="time" value={peak.end || "00:00"}
                                            onChange={e => peakUpdateSlab("peakSurcharge", 0, "end", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        {(formData.peakSurcharge?.[0]?.slabs || []).slice(0, 2).map((slab, j) => {
                                            const isSecond = j === 1;
                                            const currentFirstMaxKm = formData.peakSurcharge?.[0]?.slabs?.[0]?.maxKm || 0;
                                            const placeholder = isSecond ? `Above ${currentFirstMaxKm} km` : "Max Km for this slab";

                                            return (
                                                <div key={j} className="flex gap-3 items-center">
                                                    <Input
                                                        label={isSecond ? "" : "Max Km"}
                                                        type="number"
                                                        value={isSecond ? "" : (slab.maxKm || "")}
                                                        placeholder={placeholder}
                                                        disabled={isSecond}
                                                        onChange={e => {
                                                            const value = e.target.value;
                                                            const numValue = value === "" ? null : Number(value);
                                                            peakUpdateSlab("peakSurcharge", 0, `slabs[${j}].maxKm`, numValue);
                                                            if (j === 0) {
                                                                peakUpdateSlab("peakSurcharge", 0, "slabs[1].maxKm", null);
                                                            }
                                                        }}
                                                        labelProps={{ className: isSecond ? "hidden" : "" }}
                                                    />
                                                    <Input
                                                        type="number" label="₹/km" value={slab.amountPerKm || 0}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            const num = val === "" ? 0 : Number(val);
                                                            peakUpdateSlab("peakSurcharge", 0, `slabs[${j}].amountPerKm`, num);
                                                        }}
                                                    />
                                                </div>

                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 p-4 border rounded">
                        <div>
                            <Typography variant="small" className="mb-2 font-medium">Weather Surcharge</Typography>
                            <div className="flex items-center gap-3 mb-3">
                                <Typography variant="small" className="font-medium">Status</Typography>
                                <Switch
                                    checked={formData.weatherSurcharge?.[0]?.status === 'ACTIVE'}
                                    onChange={e => updateSlab('weatherSurcharge', 0, 'status', e.target.checked ? 'ACTIVE' : 'INACTIVE')}
                                    color="blue"
                                />
                                <Typography variant="small" className={`font-medium ${formData.weatherSurcharge?.[0]?.status === 'ACTIVE' ? "text-blue-600" : "text-gray-500"}`}>
                                    {formData.weatherSurcharge?.[0]?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                </Typography>
                            </div>
                            <Input
                                type="number" label="Amount ₹" value={formData.weatherSurcharge?.[0]?.amount || 0}
                                onChange={e => updateSlab('weatherSurcharge', 0, 'amount', isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)}
                            />
                        </div>

                    <div>
                            <Typography variant="small" className="mb-2 font-medium">Handling Surcharge</Typography>
                            <div className="flex items-center gap-3 mb-3">
                                <Typography variant="small" className="font-medium">Status</Typography>
                                <Switch
                                    checked={formData.handlingSurcharge?.[0]?.status === 'ACTIVE'}
                                    onChange={e => updateSlab('handlingSurcharge', 0, 'status', e.target.checked ? 'ACTIVE' : 'INACTIVE')}
                                    color="amber"
                                />
                                <Typography variant="small" className={`font-medium ${formData.handlingSurcharge?.[0]?.status === 'ACTIVE' ? "text-amber-600" : "text-gray-500"}`}>
                                    {formData.handlingSurcharge?.[0]?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                </Typography>
                            </div>
                            <Input type="number" label="Amount ₹" value={formData.handlingSurcharge?.[0]?.amount || 0}
                                onChange={e => updateSlab('handlingSurcharge', 0, 'amount', isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)}
                            />
                        </div>
                    </div>
                </DialogBody>

                <DialogFooter>
                    <Button variant="text" color="gray" onClick={handleCloseModal} disabled={saving}>
                        Cancel
                    </Button>
                    <Button size="sm" color="green" onClick={handleSaveAndSubmit} disabled={saving}>Save</Button>

                </DialogFooter>
            </Dialog>

            <div className="flex">
                <Button fullWidth onClick={() => navigate('/dashboard/finance/master-price')} className={`my-6 mx-2 ${ColorStyles.backButton}`}>
                    Back
                </Button>
            </div>

            <MasterPriceLogParcel id={id} />
        </>
    );
}