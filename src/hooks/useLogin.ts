import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async (idToken: string) => {
        setIsLoading(true);
        setError('');
        try {
            await loginWithGoogle(idToken);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        isLoading,
        error,
        handleSubmit,
        handleGoogleLogin,
    };
};
