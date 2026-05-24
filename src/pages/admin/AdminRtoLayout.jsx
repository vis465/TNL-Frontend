import React from 'react';
import AdminSectionTabsLayout from '../../components/admin/AdminSectionTabsLayout';
import { ADMIN_RTO_HOME, ADMIN_RTO_TABS } from '../../config/adminRtoNav';

export default function AdminRtoLayout() {
  return (
    <AdminSectionTabsLayout
      title="RTO & traffic fines"
      description="Manage offence types, review challans, and configure enforcement limits. Settlement is manual via rider or division wallet."
      tabs={ADMIN_RTO_TABS}
      defaultTabTo={ADMIN_RTO_HOME}
    />
  );
}
