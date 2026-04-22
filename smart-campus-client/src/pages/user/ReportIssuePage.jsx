import React from 'react';
import TicketsPage from '../tickets/TicketsPage';
import { useAuth } from '../../context/AuthContext';

const ReportIssuePage = () => {
  const { user } = useAuth();

  const scope =
    user?.role === 'TECHNICIAN'
      ? 'assigned'
      : user?.role === 'USER'
        ? 'mine'
        : 'all';

  return (
    <main className="dash-main user-page-main">
      <TicketsPage scope={scope} />
    </main>
  );
};

export default ReportIssuePage;
