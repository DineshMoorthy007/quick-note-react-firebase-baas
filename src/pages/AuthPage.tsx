import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPage.css';

interface FirebaseError {
  code?: string;
  message: string;
}

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const getErrorMessage = (err: unknown): string => {
    const firebaseError = err as FirebaseError;
    
    if (firebaseError.code) {
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          return 'User not found. Please check your email or create an account.';
        case 'auth/wrong-password':
          return 'Invalid credentials. Please try again.';
        case 'auth/invalid-email':
          return 'Invalid email address.';
        case 'auth/email-already-in-use':
          return 'This email is already registered. Please sign in instead.';
        case 'auth/weak-password':
          return 'Password is too weak. Please use at least 6 characters.';
        case 'auth/operation-not-allowed':
          return 'Authentication is currently disabled.';
        case 'auth/too-many-requests':
          return 'Too many login attempts. Please try again later.';
        default:
          return firebaseError.message || 'An authentication error occurred.';
      }
    }
    
    return firebaseError.message || 'An error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      // Success - redirect handled by App.tsx or routing logic
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (): void => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-header">
          <div className="logo-icon">📋</div>
          <h1>Quick-Note</h1>
        </div>

        {/* Title and Subtitle */}
        <div className="auth-title-section">
          <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
          <p>{isLogin ? 'Sign in to your pinboard.' : 'Start pinning your notes.'}</p>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading
              ? 'Loading...'
              : isLogin
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        {/* Toggle Link */}
        <div className="auth-toggle">
          <span>
            {isLogin
              ? "Don't have an account? "
              : 'Already have an account? '}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            disabled={isLoading}
            className="toggle-link"
          >
            {isLogin ? 'Register' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
