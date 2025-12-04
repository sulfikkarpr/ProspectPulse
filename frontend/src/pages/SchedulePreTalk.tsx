import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Select } from '../components/Select';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import api from '../services/api';

interface Prospect {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

const SchedulePreTalk = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    prospect_id: '',
    mentor_id: '',
    scheduled_at: '',
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: prospects = [] } = useQuery<Prospect[]>({
    queryKey: ['prospects'],
    queryFn: async () => {
      const response = await api.get('/prospects');
      return response.data;
    },
  });

  const { data: mentors = [] } = useQuery<User[]>({
    queryKey: ['mentors'],
    queryFn: async () => {
      const response = await api.get('/users/mentors');
      return response.data;
    },
  });

  const { data: preTalks = [], isLoading } = useQuery({
    queryKey: ['pretalks'],
    queryFn: async () => {
      const response = await api.get('/pretalks');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/pretalks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pretalks'] });
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      setIsModalOpen(false);
      setFormData({
        prospect_id: '',
        mentor_id: '',
        scheduled_at: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Pre-Talk</h1>
          <Button onClick={() => setIsModalOpen(true)}>Schedule New Pre-Talk</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : preTalks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No pre-talks scheduled. Schedule your first pre-talk!
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {preTalks.map((talk: any) => (
                <li key={talk.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {talk.prospect_name}
                        </h3>
                        <span
                          className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            talk.status
                          )}`}
                        >
                          {talk.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Mentor: {talk.mentor_name}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Scheduled: {new Date(talk.scheduled_at).toLocaleString()}
                      </div>
                      {talk.meet_link && (
                        <a
                          href={talk.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-blue-600 hover:underline text-sm"
                        >
                          Join Google Meet →
                        </a>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/prospects/${talk.prospect_id}`)}
                    >
                      View Prospect
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Schedule Pre-Talk"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Prospect *"
              value={formData.prospect_id}
              onChange={(e) => setFormData({ ...formData, prospect_id: e.target.value })}
              required
            >
              <option value="">Select prospect</option>
              {prospects.map((prospect) => (
                <option key={prospect.id} value={prospect.id}>
                  {prospect.name}
                </option>
              ))}
            </Select>

            <Select
              label="Mentor *"
              value={formData.mentor_id}
              onChange={(e) => setFormData({ ...formData, mentor_id: e.target.value })}
              required
            >
              <option value="">Select mentor</option>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name}
                </option>
              ))}
            </Select>

            <Input
              label="Scheduled Date & Time *"
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              required
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
                {createMutation.isPending ? 'Scheduling...' : 'Schedule Pre-Talk'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default SchedulePreTalk;
