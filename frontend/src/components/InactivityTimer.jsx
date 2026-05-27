import React, { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const InactivityTimer = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const resetTimers = () => {
    // Reset warning and logout timers on user activity
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    if (isAuthenticated) {
      // Set Warning Alert to trigger at 4 minutes (240,000 ms)
      warningTimerRef.current = setTimeout(() => {
        toast('Security: You will be logged out in 60 seconds due to inactivity.', {
          icon: '⚠️',
          style: {
            background: '#b45309', // Amber background
            color: '#fff',
          },
        });
      }, 240000);

      // Set Auto Logout kick-out at 5 minutes (300,000 ms)
      logoutTimerRef.current = setTimeout(() => {
        toast.error('Session expired due to inactivity.');
        logout();
      }, 300000);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      resetTimers();

      // Attach event listeners to monitor activity
      events.forEach((event) => {
        window.addEventListener(event, resetTimers);
      });

      return () => {
        // Cleanup event listeners and timers on unmount
        events.forEach((event) => {
          window.removeEventListener(event, resetTimers);
        });
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      };
    }
  }, [isAuthenticated]);

  return null; // Headless component
};

export default InactivityTimer;
