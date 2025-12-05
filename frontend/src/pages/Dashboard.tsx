import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const queryClient = useQueryClient();

  const { data: dailyStats } = useQuery({
    queryKey: ['dashboard', 'daily'],
    queryFn: async () => {
      const response = await api.get('/dashboard/daily');
      return response.data;
    },
  });

  const { data: weeklyStats } = useQuery({
    queryKey: ['dashboard', 'weekly'],
    queryFn: async () => {
      const response = await api.get('/dashboard/weekly');
      return response.data;
    },
  });

  const { data: monthlyStats } = useQuery({
    queryKey: ['dashboard', 'monthly'],
    queryFn: async () => {
      const response = await api.get('/dashboard/monthly');
      return response.data;
    },
  });

  const { data: syncStatus } = useQuery({
    queryKey: ['sync', 'status'],
    queryFn: async () => {
      const response = await api.get('/sync/status');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/sync/sheets');
      return response.data;
    },
    onSuccess: () => {
      // Refresh sync status after successful sync
      queryClient.invalidateQueries({ queryKey: ['sync', 'status'] });
      alert('✅ Successfully synced all data to Google Sheets!\n\nYour Google Sheet has been updated with:\n- All prospects\n- All pre-talks\n- All activity logs');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Failed to sync to Google Sheets';
      alert(`❌ Sync Error: ${message}\n\nPlease check:\n- Google Sheets API is enabled\n- Sheet is shared with your Google account\n- Sheet ID is correct in backend/.env`);
    },
  });

  const handleSync = () => {
    if (window.confirm('Sync all data to Google Sheets?\n\nThis will update:\n- Prospects sheet\n- PreTalks sheet\n- ActivityLogs sheet\n\nContinue?')) {
      syncMutation.mutate();
    }
  };

  const weeklyChartData = weeklyStats?.prospects_by_day?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    prospects: parseInt(item.count),
  })) || [];

  return (
    <Layout>
      <div className="px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            {syncStatus?.last_sync && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Last synced: {new Date(syncStatus.last_sync).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {syncMutation.isPending && (
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="animate-pulse">Syncing...</span>
              </div>
            )}
            <Button 
              onClick={handleSync} 
              disabled={syncMutation.isPending}
              variant={syncMutation.isPending ? 'secondary' : 'primary'}
              size="sm"
              className="text-xs sm:text-sm"
            >
              {syncMutation.isPending ? (
                <>⏳ Syncing...</>
              ) : (
                <>📊 Sync</>
              )}
            </Button>
          </div>
        </div>

        {syncStatus?.sheets && syncStatus.sheets.length > 0 && (
          <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">Sync Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {syncStatus.sheets.map((sheet: any) => (
                <div key={sheet.sheet_name} className="text-sm">
                  <span className="font-medium text-blue-800 capitalize">{sheet.sheet_name}:</span>{' '}
                  <span className="text-blue-600">
                    {sheet.last_sync_row_count || 0} rows
                    {sheet.last_synced_at && (
                      <span className="text-blue-500 text-xs ml-2">
                        ({new Date(sheet.last_synced_at).toLocaleDateString()})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-2">Daily Activity</h2>
            {dailyStats ? (
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-600">
                  {dailyStats.prospects?.reduce((acc: number, p: any) => acc + parseInt(p.count), 0) || 0}
                </p>
                <p className="text-sm text-gray-500">New Prospects Today</p>
              </div>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-2">Weekly Activity</h2>
            {weeklyStats ? (
              <div className="space-y-2">
                <p className="text-3xl font-bold text-green-600">
                  {weeklyStats.prospects_by_day?.reduce((acc: number, p: any) => acc + parseInt(p.count), 0) || 0}
                </p>
                <p className="text-sm text-gray-500">Prospects This Week</p>
              </div>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-2">Monthly Summary</h2>
            {monthlyStats ? (
              <div className="space-y-2">
                <p className="text-3xl font-bold text-purple-600">
                  {monthlyStats.total_prospects || 0}
                </p>
                <p className="text-sm text-gray-500">Total Prospects This Month</p>
              </div>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </div>
        </div>

        {weeklyChartData.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Weekly Prospects Trend</h2>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="prospects" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {monthlyStats && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Status Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {monthlyStats.status_breakdown?.map((item: any) => (
                <div key={item.status} className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">{item.status.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
