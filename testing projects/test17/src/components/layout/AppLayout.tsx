import React from 'react';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div style={{ background: '#000', color: '#fff', position: 'relative' }}>
      <Outlet />
    </div>
  );
};

export default AppLayout;