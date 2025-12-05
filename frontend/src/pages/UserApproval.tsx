import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
  is_approved: boolean;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
  is_approved: boolean;
  created_at: string;
}

const UserApproval = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);

  const { data: pendingUsers, isLoading: pendingLoading } = useQuery<PendingUser[]>({
    queryKey: ['pendingUsers'],
    queryFn: async () => {
      const response = await api.get('/users/pending');
      return response.data;
    },
  });

  const { data: allUsers, isLoading: allUsersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
    enabled: showAllUsers,
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/users/${userId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to approve user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteUserId(null);
      setDeleteUserName('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to delete user');
    },
  });

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteUserId(userId);
    setDeleteUserName(userName);
  };

  const handleDeleteConfirm = () => {
    if (deleteUserId) {
      deleteMutation.mutate(deleteUserId);
    }
  };

  const isLoading = pendingLoading || (showAllUsers && allUsersLoading);
  const usersToShow = showAllUsers ? allUsers : pendingUsers;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                {showAllUsers ? 'Manage all users' : 'Review and approve new user registrations'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="w-full sm:w-auto"
            >
              {showAllUsers ? 'Show Pending Only' : 'Show All Users'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {usersToShow && usersToShow.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
            <p className="text-gray-500">
              {showAllUsers ? 'No users found' : 'No pending users to approve'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersToShow?.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar_url}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_approved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {!user.is_approved && (
                            <Button
                              onClick={() => approveMutation.mutate(user.id)}
                              disabled={approveMutation.isPending}
                              size="sm"
                            >
                              {approveMutation.isPending ? 'Approving...' : 'Approve'}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(user.id, user.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-200">
              {usersToShow?.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1 min-w-0">
                      {user.avatar_url ? (
                        <img
                          className="h-10 w-10 rounded-full flex-shrink-0"
                          src={user.avatar_url}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_approved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.is_approved ? 'Approved' : 'Pending'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!user.is_approved && (
                      <Button
                        onClick={() => approveMutation.mutate(user.id)}
                        disabled={approveMutation.isPending}
                        size="sm"
                        className="flex-1"
                      >
                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(user.id, user.name)}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteUserId !== null}
          onClose={() => {
            setDeleteUserId(null);
            setDeleteUserName('');
          }}
          title="Delete User"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{deleteUserName}</strong>?
            </p>
            <p className="text-sm text-red-600">
              ⚠️ This action cannot be undone. All data associated with this user will be deleted.
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteUserId(null);
                  setDeleteUserName('');
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default UserApproval;
