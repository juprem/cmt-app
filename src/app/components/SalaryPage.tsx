import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Euro, Calculator, Save, AlertCircle } from 'lucide-react';
import { InputNumber, Button, Card, Divider, Alert, Space } from 'antd';
import { useAuth } from '@/app/lib/AuthContext';

export const SalaryPage = () => {
  const { user, updateSalary } = useAuth();
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculator state
  const [monthlySalary, setMonthlySalary] = useState<number>(0);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(35);

  useEffect(() => {
    if (user?.hourly_rate) {
      setHourlyRate(Number(user.hourly_rate));
    }
  }, [user]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateSalary(hourlyRate);
    setIsUpdating(false);
  };

  const calculateHourly = () => {
    if (monthlySalary > 0 && hoursPerWeek > 0) {
      // Calculation: (Monthly * 12) / (HoursPerWeek * 52)
      const calculated = (monthlySalary * 12) / (hoursPerWeek * 52);
      setHourlyRate(Number(calculated.toFixed(2)));
    }
  };

  const hasSalarySet = user?.hourly_rate && Number(user.hourly_rate) > 0;

  return (
    <div className="p-6 bg-slate-950 pb-8 min-h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white">Earnings Center <span className="text-green-500">💶</span></h2>
        <p className="text-slate-400 text-sm mt-1">Configure your professional value.</p>
      </div>

      {!hasSalarySet && (
        <Alert
          message="Salary Setup Required"
          description="You must set your hourly rate before you can access the timer or soundboard. We need this to calculate your earnings!"
          type="warning"
          showIcon
          icon={<AlertCircle className="text-yellow-500" />}
          className="mb-12 bg-yellow-500/10 border-yellow-500/20 rounded-2xl"
        />
      )}

      {/* Hourly Rate Card */}
      <Card className="bg-slate-900 border-white/10 rounded-[2rem] overflow-hidden mb-12 shadow-2xl">
        <div className="p-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">Current Hourly Rate</label>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">€</span>
              <InputNumber
                className="w-full bg-slate-800 border-slate-700 text-white h-16 rounded-2xl pl-8 text-2xl font-black flex items-center"
                value={hourlyRate}
                onChange={(val) => setHourlyRate(val || 0)}
                min={0}
                precision={2}
              />
            </div>
            <Button
              type="primary"
              size="large"
              icon={<Save size={20} />}
              loading={isUpdating}
              onClick={handleUpdate}
              className="h-16 px-8 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 border-none font-bold"
            >
              SAVE
            </Button>
          </div>
          <p className="text-slate-500 text-xs italic">
            Tip: Your hourly rate is used to calculate earnings in real-time during your sessions.
          </p>
        </div>
      </Card>

      <Divider className="border-white/5" />

      {/* Conversion Tool */}
      <div className="mb-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2">
          Wage Converter <Calculator size={20} className="text-purple-400" />
        </h3>
        <p className="text-slate-500 text-sm">Don't know your hourly rate? Let's calculate it based on your contract.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Monthly Net Salary (€)</label>
              <InputNumber
                className="w-full bg-slate-800 border-slate-700 text-white h-12 rounded-xl flex items-center"
                value={monthlySalary}
                onChange={(val) => setMonthlySalary(val || 0)}
                placeholder="2500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Work Hours Per Week</label>
              <InputNumber
                className="w-full bg-slate-800 border-slate-700 text-white h-12 rounded-xl flex items-center"
                value={hoursPerWeek}
                onChange={(val) => setHoursPerWeek(val || 0)}
                placeholder="35"
              />
            </div>
            <Button
              block
              className="h-12 bg-white/5 border-white/10 text-white font-bold rounded-xl hover:bg-white/10"
              onClick={calculateHourly}
            >
              CALCULATE & APPLY
            </Button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .ant-input-number-input {
          color: white !important;
          height: 100% !important;
        }
        .ant-alert-message {
          color: #eab308 !important;
          font-weight: 800 !important;
        }
        .ant-alert-description {
          color: rgba(255, 255, 255, 0.7) !important;
          font-size: 12px !important;
        }
      `}} />
    </div>
  );
};
