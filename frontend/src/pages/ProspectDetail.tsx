import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Textarea } from '../components/Textarea';
import { Modal } from '../components/Modal';
import api from '../services/api';

interface PreTalk {
  id: string;
  scheduled_at: string;
  mentor_name: string;
  status: string;
  meet_link?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  user_name: string;
  created_at: string;
}

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
  created_by_name?: string;
  referred_by_name?: string;
  activity_logs: ActivityLog[];
  pre_talks: PreTalk[];
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
  });

  useEffect(() => {
    if (prospect) {
      setNotes(prospect.notes || '');
    }
  }, [prospect]);

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
      <div className="px-2 sm:px-4 lg:px-6">
        <Button variant="outline" onClick={() => navigate('/prospects')} className="mb-4 text-sm" size="sm">
          ← Back
        </Button>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{prospect.name}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Created: {new Date(prospect.created_at).toLocaleString()}
              </p>
            </div>
            <span className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-blue-100 text-blue-800 self-start">
              {prospect.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
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
            {prospect.created_by_name && (
              <div>
                <label className="text-sm font-medium text-gray-500">Created By</label>
                <p className="text-gray-900">{prospect.created_by_name}</p>
              </div>
            )}
            {prospect.referred_by_name && (
              <div>
                <label className="text-sm font-medium text-gray-500">Referred By</label>
                <p className="text-gray-900">{prospect.referred_by_name}</p>
              </div>
            )}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Pre-Talks</h2>
            {prospect.pre_talks.length === 0 ? (
              <p className="text-gray-500">No pre-talks scheduled</p>
            ) : (
              <ul className="space-y-3">
                {prospect.pre_talks.map((talk: PreTalk) => (
                  <li key={talk.id} className="border-b pb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm sm:text-base">
                          {new Date(talk.scheduled_at).toLocaleString()}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Mentor: {talk.mentor_name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Status: {talk.status}</p>
                      </div>
                      {talk.meet_link && (
                        <a
                          href={talk.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs sm:text-sm self-start sm:self-center"
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

          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Activity Log</h2>
            {prospect.activity_logs.length === 0 ? (
              <p className="text-gray-500">No activity logged</p>
            ) : (
              <ul className="space-y-3">
                {prospect.activity_logs.map((log: ActivityLog) => (
                  <li key={log.id} className="border-b pb-3">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{log.action.replace('_', ' ')}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        By: {log.user_name} •{' '}
                        {new Date(log.created_at).toLocaleString()}
                      </p>
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
