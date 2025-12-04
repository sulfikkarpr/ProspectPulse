import { useState } from 'react';
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    queryKey: ['prospects', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
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

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Prospects</h1>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                if (window.confirm('Sync all data to Google Sheets?')) {
                  syncMutation.mutate();
                }
              }}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? '⏳ Syncing...' : '📊 Sync to Sheets'}
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>Add Prospect</Button>
          </div>
        </div>

        <div className="mb-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="call_done">Call Done</option>
            <option value="pre_talk_scheduled">Pre-Talk Scheduled</option>
            <option value="follow_up">Follow Up</option>
            <option value="closed">Closed</option>
            <option value="not_interested">Not Interested</option>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : prospects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No prospects found. Create your first prospect!
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {prospects.map((prospect) => (
                <li
                  key={prospect.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/prospects/${prospect.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {prospect.name}
                        </h3>
                        <span
                          className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            prospect.status
                          )}`}
                        >
                          {prospect.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {prospect.phone && <span>Phone: {prospect.phone}</span>}
                        {prospect.email && (
                          <span className="ml-4">Email: {prospect.email}</span>
                        )}
                        {prospect.city && (
                          <span className="ml-4">City: {prospect.city}</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Source: {prospect.source} • Created:{' '}
                        {new Date(prospect.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
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
