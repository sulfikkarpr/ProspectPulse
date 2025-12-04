import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Textarea } from '../components/Textarea';
import { Modal } from '../components/Modal';
import api from '../services/api';

interface ProspectDetail {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  city?: string;
  profession?: string;
  source: string;
  status: string;
  notes?: string;
  created_at: string;
  activity_logs: any[];
  pre_talks: any[];
}

const ProspectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditNotesOpen, setIsEditNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const { data: prospect, isLoading } = useQuery<ProspectDetail>({
    queryKey: ['prospect', id],
    queryFn: async () => {
      const response = await api.get(`/prospects/${id}`);
      return response.data;
    },
    enabled: !!id,
    onSuccess: (data) => {
      setNotes(data.notes || '');
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (newNotes: string) => {
      const response = await api.put(`/prospects/${id}`, { notes: newNotes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospect', id] });
      setIsEditNotesOpen(false);
    },
  });

  const handleSaveNotes = () => {
    updateNotesMutation.mutate(notes);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  if (!prospect) {
    return (
      <Layout>
        <div className="text-center py-12">Prospect not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <Button variant="outline" onClick={() => navigate('/prospects')} className="mb-4">
          ← Back to Prospects
        </Button>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{prospect.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(prospect.created_at).toLocaleString()}
              </p>
            </div>
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              {prospect.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{prospect.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{prospect.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Age</label>
              <p className="text-gray-900">{prospect.age || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">City</label>
              <p className="text-gray-900">{prospect.city || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Profession</label>
              <p className="text-gray-900">{prospect.profession || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Source</label>
              <p className="text-gray-900">{prospect.source}</p>
            </div>
          </div>

          {prospect.notes && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditNotesOpen(true)}
                >
                  Edit Notes
                </Button>
              </div>
              <p className="text-gray-900 whitespace-pre-wrap">{prospect.notes}</p>
            </div>
          )}

          {!prospect.notes && (
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditNotesOpen(true)}
              >
                Add Notes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pre-Talks</h2>
            {prospect.pre_talks.length === 0 ? (
              <p className="text-gray-500">No pre-talks scheduled</p>
            ) : (
              <ul className="space-y-3">
                {prospect.pre_talks.map((talk) => (
                  <li key={talk.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(talk.scheduled_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Mentor: {talk.mentor_name}</p>
                        <p className="text-sm text-gray-500">Status: {talk.status}</p>
                      </div>
                      {talk.meet_link && (
                        <a
                          href={talk.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Join Meet
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
            {prospect.activity_logs.length === 0 ? (
              <p className="text-gray-500">No activity logged</p>
            ) : (
              <ul className="space-y-3">
                {prospect.activity_logs.map((log) => (
                  <li key={log.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{log.action.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">
                          By: {log.user_name} •{' '}
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Modal
          isOpen={isEditNotesOpen}
          onClose={() => setIsEditNotesOpen(false)}
          title="Edit Notes"
          size="lg"
        >
          <div className="space-y-4">
            <Textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              placeholder="Add notes about this prospect, conversations, follow-ups, concerns, etc..."
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditNotesOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNotes}
                disabled={updateNotesMutation.isPending}
              >
                {updateNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default ProspectDetail;
