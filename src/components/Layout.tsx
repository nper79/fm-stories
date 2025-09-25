import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Layout.module.css';
import { useState } from 'react';

const navItems = [
  { label: 'Discover', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Account', href: '/account' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const displayName = profile?.displayName || profile?.email || '';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <Link href="/" className={styles.brand}>
            <span className={styles.logoGlyph}>FM</span>
            <span className={styles.logoWord}>Stories</span>
          </Link>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navItem}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.searchWrapper}>
          <input className={styles.searchInput} placeholder="Search immersive audio adventures" />
        </div>

        <div className={styles.actions}>
          <Link href="/stories/forbidden-desire" className={styles.secondaryAction}>
            Featured Story
          </Link>
          {profile ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={open}
              >
                <span className={styles.userAvatar}>{initials}</span>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.chevron}>{open ? '?' : '?'}</span>
              </button>
              {open && (
                <div className={styles.dropdown} role="menu">
                  <Link href="/account" className={styles.dropdownItem} onClick={() => setOpen(false)}>
                    Account
                  </Link>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setOpen(false);
                      void signOutUser();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className={styles.primaryAction} href="/login">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>Copyright {new Date().getFullYear()} FM Stories. Built for immersive listening.</p>
          <div className={styles.footerLinks}>
            <Link href="#">Help</Link>
            <Link href="#">Community</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}