import Link from 'next/link';

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.logo}>
          <h1 style={styles.logoText}>MLOps Dashboard</h1>
        </div>
        <div style={styles.rightSection}>
          <Link href="/settings" style={styles.iconButton}>
            ⚙️
          </Link>
          <div style={styles.userProfile}>
            <div style={styles.avatar}>👤</div>
            <span style={styles.username}>Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 250,
    right: 0,
    height: 70,
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 100,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    padding: '0 2rem',
  },
  logo: {},
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#111827',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  iconButton: {
    fontSize: '1.5rem',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
  },
  username: {
    fontWeight: 500,
    color: '#374151',
  },
};
