import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

interface AdminKeyUnlockProps {
  onSuccess?: () => void;
}

const AdminKeyUnlock = ({ onSuccess }: AdminKeyUnlockProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken, setAdminKeyVerified } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-admin-key', { adminKey });
      if (response.data.success && response.data.token) {
        setToken(response.data.token);
        setAdminKeyVerified(true);
        setIsOpen(false);
        setAdminKey('');
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid admin key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="text-sm"
      >
        🔓 Unlock Admin Features
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setAdminKey('');
          setError('');
        }}
        title="Admin Key Verification"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Admin Key
            </label>
            <Input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              required
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setAdminKey('');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AdminKeyUnlock;

