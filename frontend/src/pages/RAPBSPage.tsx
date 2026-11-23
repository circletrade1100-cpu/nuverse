import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RAPBSPage: React.FC = () => {
  const navigate = useNavigate();

  // Redirect to dashboard when accessing /rapbs
  useEffect(() => {
    navigate('/rapbs/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default RAPBSPage;

