import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { setNotifications, addNotification } from '../store/slices/notificationSlice';
import { notificationService } from '../services';
import { Outlet } from 'react-router-dom';

let socket = null;

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, accessToken } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!accessToken) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await notificationService.getAll({ limit: 20 });
        dispatch(setNotifications({ items: data.data, unreadCount: data.unreadCount }));
      } catch {}
    };
    fetchNotifications();

    // Connect Socket.IO
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: accessToken },
      reconnectionAttempts: 5,
    });

    socket.on('notification:new', (notification) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [accessToken]);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { socket };
