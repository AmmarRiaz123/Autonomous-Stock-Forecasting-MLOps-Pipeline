import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();

  const menuItems = [
    { path: '/', label: '📊 Dashboard', icon: '📊' },
    { path: '/tickers', label: '📈 Tickers', icon: '📈' },
    { path: '/logs', label: '📋 Logs', icon: '📋' },
    { path: '/settings', label: '⚙️ Settings', icon: '⚙️' },
  ];

  const isActive = (path) => {
    if (path === '/') return router.pathname === '/';
    return router.pathname.startsWith(path);
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.brandIcon}>🚀</div>
        <h2 style={styles.brandText}>Stock MLOps</h2>
      </div>
      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label.split(' ')[1]}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    background: '#1f2937',
    color: 'white',
    padding: '1.5rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #374151',
  },
  brandIcon: {
    fontSize: '2rem',
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 6,
    color: '#d1d5db',
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  navItemActive: {
    background: '#3b82f6',
    color: 'white',
  },
  navIcon: {
    fontSize: '1.25rem',
  },
};
