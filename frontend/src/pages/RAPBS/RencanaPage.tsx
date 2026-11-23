import React, { useState } from 'react';
import RAPBSPlanList from '../../components/RAPBS/RAPBSPlanList';
import RAPBSPlanForm from '../../components/RAPBS/RAPBSPlanForm';
import type { RAPBSPlan } from '../../types/rapbs';

const RencanaPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<RAPBSPlan | undefined>();

  const handlePlanAdd = () => {
    setSelectedPlan(undefined);
    setShowPlanForm(true);
  };

  const handlePlanEdit = (plan: RAPBSPlan) => {
    setSelectedPlan(plan);
    setShowPlanForm(true);
  };

  const handlePlanView = (plan: RAPBSPlan) => {
    // TODO: Implement view plan details
    console.log('View plan:', plan);
    alert(`Detail Rencana: ${plan.title}\n\nAnggaran: Rp ${plan.planned_amount.toLocaleString('id-ID')}\nStatus: ${plan.status}`);
  };

  const handlePlanSave = () => {
    setShowPlanForm(false);
    setSelectedPlan(undefined);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan List */}
        <RAPBSPlanList
          onAdd={handlePlanAdd}
          onEdit={handlePlanEdit}
          onView={handlePlanView}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Modal Form */}
      {showPlanForm && (
        <RAPBSPlanForm 
          plan={selectedPlan} 
          onClose={() => setShowPlanForm(false)} 
          onSave={handlePlanSave} 
        />
      )}
    </div>
  );
};

export default RencanaPage;

