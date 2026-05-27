import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token is found
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const { data } = await API.get('/user/profile');
          if (data && data.success) {
            setUser(data.user);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Session restoration failed:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Register method
  const register = async (name, email, password, phone, address, accountType, dob) => {
    try {
      setLoading(true);
      const { data } = await API.post('/auth/register', { 
        name, 
        email, 
        password,
        phone,
        address,
        accountType,
        dob
      });
      
      if (data && data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          accountType: data.accountType,
          dob: data.dob,
          accountNumber: data.accountNumber,
          balance: data.balance,
        });
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch (error) {
      console.error('Registration API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Could not connect to authentication service.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Login method
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await API.post('/auth/login', { email, password });

      if (data && data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          accountType: data.accountType,
          dob: data.dob,
          accountNumber: data.accountNumber,
          balance: data.balance,
        });
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (error) {
      console.error('Login API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Could not connect to authentication service.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout method
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Reload profile from API (used to refresh balance in frontend components)
  const reloadProfile = async () => {
    if (token) {
      try {
        const { data } = await API.get('/user/profile');
        if (data && data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Profile reload failed:', error.message);
      }
    }
  };

  // Delete user account permanently
  const deleteAccount = async () => {
    try {
      setLoading(true);
      const { data } = await API.delete('/user/profile');
      if (data && data.success) {
        logout();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Purging account failed.' };
    } catch (error) {
      console.error('Delete Account API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Could not connect to deletion service.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Transfer funds to another account
  const transferFunds = async (recipientIdentifier, amount) => {
    try {
      const { data } = await API.post('/account/transfer', { recipientIdentifier, amount });
      if (data && data.success) {
        setUser((prev) => ({ ...prev, balance: data.balance }));
        return { success: true, message: data.message, transaction: data.transaction };
      }
      return { success: false, message: data.message || 'Transfer failed.' };
    } catch (error) {
      console.error('Transfer API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Could not connect to transfer service.',
      };
    }
  };

  // Toggle virtual card freeze state
  const toggleCardFreeze = async () => {
    try {
      const { data } = await API.post('/account/toggle-card');
      if (data && data.success) {
        setUser((prev) => ({ ...prev, isCardFrozen: data.isCardFrozen }));
        return { success: true, message: data.message, isCardFrozen: data.isCardFrozen };
      }
      return { success: false, message: data.message || 'Failed to toggle card status.' };
    } catch (error) {
      console.error('Card Toggle API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Could not connect to card security service.',
      };
    }
  };

  // Save payee in directory
  const addSavedPayee = async (name, accountNumber) => {
    try {
      const { data } = await API.post('/account/payees', { name, accountNumber });
      if (data && data.success) {
        setUser((prev) => ({ ...prev, payees: data.payees }));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to save payee.' };
    } catch (error) {
      console.error('Add Payee API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Could not connect to directory service.',
      };
    }
  };

  // Delete payee from directory
  const deleteSavedPayee = async (accountNumber) => {
    try {
      const { data } = await API.delete(`/account/payees/${accountNumber}`);
      if (data && data.success) {
        setUser((prev) => ({ ...prev, payees: data.payees }));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to delete payee.' };
    } catch (error) {
      console.error('Delete Payee API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Could not connect to directory service.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        reloadProfile,
        deleteAccount,
        transferFunds,
        toggleCardFreeze,
        addSavedPayee,
        deleteSavedPayee,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

};
