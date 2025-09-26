import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuthedFetch } from '@/hooks/useAuthedFetch';
import Link from 'next/link';
import styles from '@/styles/AdminDashboard.module.css';

interface DashboardStats {
  totalStories: number;
  totalUsers: number;
  premiumUsers: number;
  newUsersThisMonth: number;
  totalPlays: number;
  revenueThisMonth: number;
}

export default function AdminDashboardPage() {
  const authedFetch = useAuthedFetch();
  const [stats, setStats] = useState<DashboardStats>({
    totalStories: 0,
    totalUsers: 0,
    premiumUsers: 0,
    newUsersThisMonth: 0,
    totalPlays: 0,
    revenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Load basic stats from existing endpoints
      const [storiesResponse, usersResponse] = await Promise.all([
        authedFetch('/api/admin/stories'),
        authedFetch('/api/admin/users'),
      ]);

      if (!storiesResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const storiesData = await storiesResponse.json();
      const usersData = await usersResponse.json();

      const stories = storiesData.stories || [];
      const users = usersData.users || [];

      // Calculate stats
      const totalStories = stories.length;
      const totalUsers = users.length;
      const premiumUsers = users.filter((u: any) => u.subscriptionTier === 'premium').length;

      // Calculate new users this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newUsersThisMonth = users.filter((u: any) => {
        if (!u.createdAt) return false;
        const userDate = new Date(u.createdAt);
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
      }).length;

      setStats({
        totalStories,
        totalUsers,
        premiumUsers,
        newUsersThisMonth,
        totalPlays: 0, // Placeholder
        revenueThisMonth: 0, // Placeholder
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className={styles.loading}>Loading dashboard...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className={styles.container}>
        {error && (
          <div className={styles.error}>
            <span>⚠️</span>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.totalStories}</div>
              <div className={styles.statLabel}>Total Stories</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.totalUsers}</div>
              <div className={styles.statLabel}>Total Users</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.premiumUsers}</div>
              <div className={styles.statLabel}>Premium Users</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.newUsersThisMonth}</div>
              <div className={styles.statLabel}>New This Month</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.actionsGrid}>
          <Link href="/admin/stories" className={styles.actionCard}>
            <div className={styles.actionIcon}>📝</div>
            <div className={styles.actionContent}>
              <h3>Manage Stories</h3>
              <p>Add, edit, and delete audio stories with file uploads</p>
            </div>
          </Link>

          <Link href="/admin/users" className={styles.actionCard}>
            <div className={styles.actionIcon}>👤</div>
            <div className={styles.actionContent}>
              <h3>Manage Users</h3>
              <p>View user accounts and manage subscriptions</p>
            </div>
          </Link>

          <Link href="/admin/files" className={styles.actionCard}>
            <div className={styles.actionIcon}>📁</div>
            <div className={styles.actionContent}>
              <h3>File Management</h3>
              <p>Upload and organize cover images and audio files</p>
            </div>
          </Link>

          <Link href="/admin/analytics" className={styles.actionCard}>
            <div className={styles.actionIcon}>📊</div>
            <div className={styles.actionContent}>
              <h3>Analytics</h3>
              <p>View detailed statistics and user behavior</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}