import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import api from '../services/api';

interface Prospect {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  city?: string;
  profession?: string;
  source: string;
  status: string;
  created_at: string;
  created_by_name?: string;
  assigned_mentor_name?: string;
  referred_by_name?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const Prospects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    city: '',
    profession: '',
    source: '',
    notes: '',
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createdByFilter, setCreatedByFilter] = useState<string>('all');
  const [referredByFilter, setReferredByFilter] = useState<string>('all');
  
  // Store filters in localStorage for persistence
  useEffect(() => {
    const saved = localStorage.getItem('prospectFilters');
    if (saved) {
      const filters = JSON.parse(saved);
      setStatusFilter(filters.status || 'all');
      setCreatedByFilter(filters.createdBy || 'all');
      setReferredByFilter(filters.referredBy || 'all');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('prospectFilters', JSON.stringify({
      status: statusFilter,
      createdBy: createdByFilter,
      referredBy: referredByFilter,
    }));
  }, [statusFilter, createdByFilter, referredByFilter]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch users for filters
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/sync/sheets');
      return response.data;
    },
    onSuccess: () => {
      alert('✅ Successfully synced all data to Google Sheets!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Failed to sync';
      alert(`❌ Sync Error: ${message}`);
    },
  });

  const { data: prospects = [], isLoading } = useQuery<Prospect[]>({
    queryKey: ['prospects', statusFilter, createdByFilter, referredByFilter, searchQuery],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (createdByFilter !== 'all') params.created_by = createdByFilter;
      if (referredByFilter !== 'all') params.referred_by = referredByFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      
      const response = await api.get('/prospects', { params });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/prospects', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      setIsModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        age: '',
        city: '',
        profession: '',
        source: '',
        notes: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (prospectId: string) => {
      await api.delete(`/prospects/${prospectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      alert('Prospect deleted successfully');
    },
    onError: (error: any) => {
      alert(`Failed to delete prospect: ${error.response?.data?.error || error.message}`);
    },
  });

  const handleDelete = (prospectId: string, prospectName: string) => {
    if (window.confirm(`Are you sure you want to delete "${prospectName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(prospectId);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      call_done: 'bg-yellow-100 text-yellow-800',
      pre_talk_scheduled: 'bg-purple-100 text-purple-800',
      follow_up: 'bg-orange-100 text-orange-800',
      closed: 'bg-green-100 text-green-800',
      not_interested: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCreatedByFilter('all');
    setReferredByFilter('all');
  };

  const hasActiveFilters = statusFilter !== 'all' || createdByFilter !== 'all' || referredByFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <Layout>
      <div className="px-2 sm:px-4 lg:px-6">
        {/* Header - Mobile Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Prospects</h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (window.confirm('Sync all data to Google Sheets?')) {
                    syncMutation.mutate();
                  }
                }}
                disabled={syncMutation.isPending}
                className="text-xs sm:text-sm"
              >
                {syncMutation.isPending ? '⏳ Syncing...' : '📊 Sync'}
              </Button>
              <Button onClick={() => setIsModalOpen(true)} size="sm" className="text-xs sm:text-sm">
                + Add Prospect
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters - Mobile Responsive */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4 space-y-3">
          {/* Search */}
          <div>
            <Input
              type="text"
              placeholder="Search by name, email, phone, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-sm"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="call_done">Call Done</option>
              <option value="pre_talk_scheduled">Pre-Talk Scheduled</option>
              <option value="follow_up">Follow Up</option>
              <option value="closed">Closed</option>
              <option value="not_interested">Not Interested</option>
            </Select>

            <Select
              value={createdByFilter}
              onChange={(e) => setCreatedByFilter(e.target.value)}
              className="w-full text-sm"
            >
              <option value="all">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>

            <Select
              value={referredByFilter}
              onChange={(e) => setReferredByFilter(e.target.value)}
              className="w-full text-sm"
            >
              <option value="all">All Referrals</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {prospects.length} prospect{prospects.length !== 1 ? 's' : ''}
            {hasActiveFilters && ' (filtered)'}
          </div>
        </div>

        {/* Prospects List - Mobile Responsive */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : prospects.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm">
            {hasActiveFilters ? 'No prospects match your filters.' : 'No prospects found. Create your first prospect!'}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {prospects.map((prospect) => (
                <li
                  key={prospect.id}
                  className="px-3 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/prospects/${prospect.id}`)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                          {prospect.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(
                            prospect.status
                          )}`}
                        >
                          {prospect.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-1 text-xs sm:text-sm text-gray-500 space-y-1">
                        {prospect.phone && <div className="inline-block mr-3">📞 {prospect.phone}</div>}
                        {prospect.email && <div className="inline-block mr-3">✉️ {prospect.email}</div>}
                        {prospect.city && <div className="inline-block">📍 {prospect.city}</div>}
                      </div>
                      <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-2">
                        <span>Source: {prospect.source}</span>
                        {prospect.created_by_name && <span>• Created by: {prospect.created_by_name}</span>}
                        {prospect.referred_by_name && <span>• Referred by: {prospect.referred_by_name}</span>}
                        <span>• {new Date(prospect.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(prospect.id, prospect.name);
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                      >
                        {deleteMutation.isPending ? 'Deleting...' : '🗑️ Delete'}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Create Prospect Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Prospect"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <Input
              label="Profession"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            />
            <Select
              label="Source *"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              required
            >
              <option value="">Select source</option>
              <option value="referred">Referred</option>
              <option value="referral">Referral</option>
              <option value="cold">Cold</option>
              <option value="warm">Warm</option>
              <option value="social_media">Social Media</option>
              <option value="other">Other</option>
            </Select>
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Add any notes about this prospect..."
            />
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                {createMutation.isPending ? 'Creating...' : 'Create Prospect'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Prospects;
