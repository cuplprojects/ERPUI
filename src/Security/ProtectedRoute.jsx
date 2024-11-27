import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserToken } from '../store/useUserToken';
import { jwtDecode } from 'jwt-decode';
import AuthService from '../CustomHooks/ApiServices/AuthService';
import { ToastContainer } from 'react-toastify';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <Navigate to="/404" replace />;
        }

        return this.props.children;
    }
}

const ProtectedRoute = ({ component: Component, permission }) => {
    const token = useUserToken();
    const { logout } = AuthService;

    const isTokenValid = (token) => {
        if (!token) return false;
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decodedToken.exp > currentTime;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    };

    useEffect(() => {
        console.log('Token:', token);
        console.log('Permission required:', permission);
        
        if (!token || !isTokenValid(token)) {
            console.log('Invalid or expired token - logging out');
            logout();
        }
    }, [token, logout, permission]);

    if (!token) {
        console.log('No token found - redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (!isTokenValid(token)) {
        console.log('Token expired - redirecting to login');
        return <Navigate to="/login" replace />;
    }

    return (
        <ErrorBoundary>
            <ToastContainer />
            <Component />
        </ErrorBoundary>
    );
};

export default ProtectedRoute;