'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart, ComposedChart
} from 'recharts';
import { BarChart2, Activity, TrendingUp, Users, MapPin, DollarSign, AlertTriangle, CreditCard, Car, Star, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AnalyticsView() {
  const [filter, setFilter] = useState('today');

  const adjustValue = (base, factor) => Math.round(base * factor);
  // Dynamic Summary Values based on filter
  const summary = {
    totalRides: filter === 'today' ? 12450 : filter === 'week' ? 87300 : 349200,
    totalRevenue: filter === 'today' ? 186750 : filter === 'week' ? 1307250 : 5229000,
    activeDrivers: filter === 'today' ? 1250 : filter === 'week' ? 1250 : 1250,
    totalCustomers: filter === 'today' ? 45600 : filter === 'week' ? 182400 : 729600,
    avgRating: 4.7,
    avgResponse: '2.1 min',
    completionRate: '94.8%',
    cancellationRate: '5.2%',
  };

  const rideGrowth = filter === 'today' ? 12.5 : filter === 'week' ? 8.3 : 15.2;
  const revenueGrowth = filter === 'today' ? 8.3 : filter === 'week' ? 12.1 : 18.7;
  const driverGrowth = filter === 'today' ? 5.8 : filter === 'week' ? 3.2 : 7.9;
  const customerGrowth = filter === 'today' ? 15.2 : filter === 'week' ? 11.8 : 22.4;

  // Rest of your data (same as before)
  const baseRideData = Array.from({ length: 24 }, (_, i) => {
    const timeLabel = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`;
    const rides = Math.floor(Math.random() * 10000 + i * 2000);
    const revenue = rides * 1.5;
    return { time: timeLabel, rides, revenue };
  });

  const rideData = filter === 'today' ? baseRideData : baseRideData.map(d => ({
    ...d,
    rides: adjustValue(d.rides, filter === 'week' ? 5 : 20),
    revenue: adjustValue(d.revenue, filter === 'week' ? 5 : 20),
  }));

  const drivers = [
    { name: 'John D.', earnings: adjustValue(135, filter === 'week' ? 5 : filter === 'month' ? 20 : 1) },
    { name: 'Sarah M.', earnings: adjustValue(92, filter === 'week' ? 5 : filter === 'month' ? 20 : 1) },
    { name: 'Mike R.', earnings: adjustValue(78, filter === 'week' ? 5 : filter === 'month' ? 20 : 1) },
    { name: 'Lisa K.', earnings: adjustValue(65, filter === 'week' ? 5 : filter === 'month' ? 20 : 1) },
    { name: 'David P.', earnings: adjustValue(28, filter === 'week' ? 5 : filter === 'month' ? 20 : 1) },
  ];

  const topCities = [
    { city: 'Chennai', revenue: adjustValue(220, filter === 'week' ? 5 : filter === 'month' ? 20 : 1) },
    { city: 'Thiruvananamali', revenue: adjustValue(190, filter === 'week' ? 5 : filter === 'month' ? 20 : 1) },
    { city: 'Kanchipuram', revenue: adjustValue(170, filter === 'week' ? 5 : filter === 'month' ? 20 : 1) },
    { city: 'Vellore', revenue: adjustValue(150, filter === 'week' ? 5 : filter === 'month' ? 20 : 1) },
  ];

  const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981'];
  const PAYMENT_COLORS = ['#3B82F6', '#06B6D4', '#22D3EE', '#EC4899', '#8B5CF6'];
  const CANCEL_COLORS = ['#EC4899', '#A855F7', '#7C3AED', '#6D28D9', '#4C1D95'];

  const paymentData = [
    { name: 'Credit', value: 200 },
    { name: 'UPI', value: 180 },
    { name: 'Wallet', value: 160 },
    { name: 'Cash', value: 140 },
    { name: 'NetBanking', value: 120 },
  ];

  const cancellationData = [
    { name: 'Customer Cancelled', value: 120 },
    { name: 'Driver Cancelled', value: 90 },
    { name: 'No Show', value: 70 },
    { name: 'System Timeout', value: 40 },
    { name: 'Payment Issue', value: 30 },
  ];

  const incentiveData = [
    { month: 'Jan', incentives: 10000, payouts: 280000 },
    { month: 'Feb', incentives: 8000, payouts: 210000 },
  ];

  const efficiencyData = [
    { metric: 'Ride Completion (%)', current: 95, target: 100 },
    { metric: 'On-time Performance (%)', current: 85, target: 90 },
    { metric: 'Vehicle Utilization (%)', current: 78, target: 85 },
    { metric: 'Driver Utilization (%)', current: 82, target: 88 },
    { metric: 'Fuel Efficiency (km/l)', current: 60, target: 80 },
  ];

  const marketingData = [
    { name: 'Summer Sale', spend: 2000, revenue: 10000, roi: 4.2 },
    { name: 'Referral Bonus', spend: 1800, revenue: 9000, roi: 3.8 },
    { name: 'New User Offer', spend: 3000, revenue: 13000, roi: 3.0 },
    { name: 'Weekend Special', spend: 2000, revenue: 8500, roi: 3.5 },
    { name: 'Loyalty Rewards', spend: 2200, revenue: 8700, roi: 4.5 },
  ];

  const profitData = [
    { name: 'Today', revenue: 520000, costs: 450000, profit: 70000 },
    { name: 'Yesterday', revenue: 500000, costs: 440000, profit: 60000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MANAGEMENT REPORTS</h1>
            <p className="text-sm text-gray-600">Real-time insights and analytics</p>
          </div>
          <div className="flex gap-3">
            {['today', 'week', 'month'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  filter === type
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50'
                }`}
              >
                {type === 'today' ? 'Today' : type === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* SUMMARY CARDS - Exactly like your image */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Operational Overview ({filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'This Month'})
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {/* Total Rides */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <Car className="w-8 h-8 text-blue-600" />
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  +{rideGrowth}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.totalRides.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total Rides</p>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  +{revenueGrowth}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{summary.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
            </div>

            {/* Active Drivers */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-cyan-600" />
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  +{driverGrowth}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.activeDrivers.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Active Drivers</p>
            </div>

            {/* Customers */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-yellow-600" />
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  +{customerGrowth}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.totalCustomers.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Customers</p>
            </div>

            {/* Avg Rating */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <Star className="w-8 h-8 text-yellow-500 fill-current" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.avgRating}/5</p>
              <p className="text-xs text-gray-500 mt-1">Avg. Rating</p>
            </div>

            {/* Avg Response */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-8 h-8 text-cyan-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.avgResponse}</p>
              <p className="text-xs text-gray-500 mt-1">Avg. Response</p>
            </div>

            {/* Completion Rate */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.completionRate}</p>
              <p className="text-xs text-gray-500 mt-1">Completion</p>
            </div>

            {/* Cancellation Rate */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <XCircle className="w-8 h-8 text-pink-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.cancellationRate}</p>
              <p className="text-xs text-gray-500 mt-1">Cancellation</p>
            </div>
          </div>
        </div>

        {/* All Charts - Unchanged */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Daily Revenue & Rides */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Daily Revenue & Ride Summary</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={rideData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="rides" stroke="#3B82F6" name="Rides" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#06B6D4" name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 2. Driver Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Driver Performance</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={drivers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earnings" fill="#3B82F6" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* City-wise Business Report */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">City-wise Business Report</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center justify-center">
                <ResponsiveContainer width={220} height={290}>
                  <PieChart>
                    <Pie
                      data={topCities}
                      dataKey="revenue"
                      nameKey="city"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                    >
                      {topCities.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                {topCities.map((c, i) => (
                  <div key={c.city} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm font-medium text-gray-800">{c.city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Growth */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Customer Growth & Retention</h3>
            </div>
            <div className="mt-4 flex gap-6 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                <span>New Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Returning Customers</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[
                { day: 'Mon', new: 280, returning: 820 },
                { day: 'Tue', new: 295, returning: 835 },
                { day: 'Wed', new: 310, returning: 850 },
                { day: 'Thu', new: 320, returning: 860 },
                { day: 'Fri', new: 330, returning: 870 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="new" stroke="#06B6D4" name="New" />
                <Line type="monotone" dataKey="returning" stroke="#EF4444" name="Returning" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cancellation & Service Quality */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-pink-600" />
              <h3 className="font-medium">Cancellation & Service Quality</h3>
            </div>
            <div className="flex justify-center items-center gap-8">
              <ResponsiveContainer width={250} height={250}>
                <PieChart>
                  <Pie data={cancellationData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {cancellationData.map((_, i) => (
                      <Cell key={i} fill={CANCEL_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 text-sm">
                {cancellationData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: CANCEL_COLORS[i] }} />
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Reconciliation */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Payment & Settlement</h3>
            </div>
            <div className="flex justify-center items-center gap-8">
              <ResponsiveContainer width={250} height={250}>
                <PieChart>
                  <Pie data={paymentData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={PAYMENT_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 text-sm">
                {paymentData.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[i] }} />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Driver Incentive */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Driver Incentive & Payout</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={incentiveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="incentives" fill="#6366F1" name="Incentives (₹)" />
                <Bar dataKey="payouts" fill="#38BDF8" name="Payouts (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Operational Efficiency */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Operational Efficiency</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={efficiencyData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Radar name="Current" dataKey="current" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
                <Radar name="Target" dataKey="target" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Marketing ROI */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-pink-600" />
              <h3 className="font-medium">Marketing ROI</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={marketingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="spend" fill="#F472B6" name="Spend" />
                <Bar yAxisId="left" dataKey="revenue" fill="#67E8F9" name="Revenue" />
                <Line yAxisId="right" dataKey="roi" stroke="#3B82F6" name="ROI %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Profitability */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-medium">Profitability & Cost</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="costs" fill="#F472B6" name="Costs" />
                <Bar dataKey="profit" fill="#34D399" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}