import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/AdminLayout.module.css';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Stories', href: '/admin/stories', icon: '📚' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Files', href: '/admin/files', icon: '📁' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title = 'Admin Panel' }: AdminLayoutProps) {
  const router = useRouter();
  const { profile, signOutUser, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>Loading admin panel...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.unauthorizedContainer}>
        <div className={styles.unauthorizedCard}>
          <h1>Access Denied</h1>
          <p>You need administrator privileges to access this area.</p>
          <Link href="/" className={styles.backButton}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandIcon}>FM</span>
            <span className={styles.brandText}>Admin</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${router.pathname === item.href ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {(profile?.displayName || profile?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>
                {profile?.displayName || profile?.email || 'Admin'}
              </div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          </div>
          <button
            onClick={() => void signOutUser()}
            className={styles.signOutButton}
            title="Sign out"
          >
            🚪
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.headerActions}>
            <Link href="/" className={styles.viewSiteButton}>
              View Site
            </Link>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}