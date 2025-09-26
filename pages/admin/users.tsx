import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuthedFetch } from '@/hooks/useAuthedFetch';
import { UserProfile } from '@/types/index';
import styles from '@/styles/AdminUsers.module.css';

interface UserStats {
  total: number;
  premium: number;
  free: number;
  newThisMonth: number;
}

export default function AdminUsersPage() {
  const authedFetch = useAuthedFetch();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, premium: 0, free: 0, newThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'premium'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await authedFetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      const userList = data.users || [];
      setUsers(userList);

      // Calculate stats
      const total = userList.length;
      const premium = userList.filter((u: UserProfile) => u.subscriptionTier === 'premium').length;
      const free = total - premium;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newThisMonth = userList.filter((u: UserProfile) => {
        if (!u.createdAt) return false;
        const userDate = new Date(u.createdAt);
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
      }).length;

      setStats({ total, premium, free, newThisMonth });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserTier = async (uid: string, subscriptionTier: 'free' | 'premium') => {
    try {
      const response = await authedFetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, subscriptionTier }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      setUsers(prev =>
        prev.map(user =>
          user.uid === uid ? { ...user, subscriptionTier } : user
        )
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        premium: subscriptionTier === 'premium' ? prev.premium + 1 : prev.premium - 1,
        free: subscriptionTier === 'free' ? prev.free + 1 : prev.free - 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterTier === 'all' || user.subscriptionTier === filterTier;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout title="User Management">
        <div className={styles.loading}>Loading users...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      <div className={styles.container}>
        {error && (
          <div className={styles.error}>
            <span>⚠️</span>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.total}</div>
              <div className={styles.statLabel}>Total Users</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.premium}</div>
              <div className={styles.statLabel}>Premium Users</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🆓</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.free}</div>
              <div className={styles.statLabel}>Free Users</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.newThisMonth}</div>
              <div className={styles.statLabel}>New This Month</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterButtons}>
            {(['all', 'free', 'premium'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`${styles.filterButton} ${filterTier === tier ? styles.active : ''}`}
              >
                {tier === 'all' ? 'All Users' : tier === 'free' ? 'Free Users' : 'Premium Users'}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className={styles.usersSection}>
          <div className={styles.sectionHeader}>
            <h2>Users ({filteredUsers.length})</h2>
          </div>

          <div className={styles.usersTable}>
            {filteredUsers.map(user => (
              <div key={user.uid} className={styles.userRow}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {(user.displayName || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>
                      {user.displayName || 'No display name'}
                    </div>
                    <div className={styles.userEmail}>{user.email}</div>
                    <div className={styles.userMeta}>
                      Joined: {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>

                <div className={styles.userStatus}>
                  <span className={`${styles.tierBadge} ${user.subscriptionTier === 'premium' ? styles.premium : styles.free}`}>
                    {user.subscriptionTier === 'premium' ? '⭐ Premium' : '🆓 Free'}
                  </span>
                </div>

                <div className={styles.userActions}>
                  {user.subscriptionTier === 'free' ? (
                    <button
                      onClick={() => handleUpdateUserTier(user.uid, 'premium')}
                      className={styles.upgradeToPremium}
                    >
                      Upgrade to Premium
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateUserTier(user.uid, 'free')}
                      className={styles.downgradeToFree}
                    >
                      Downgrade to Free
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className={styles.emptyState}>
                <p>
                  {searchTerm || filterTier !== 'all'
                    ? 'No users match your search criteria.'
                    : 'No users found.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}