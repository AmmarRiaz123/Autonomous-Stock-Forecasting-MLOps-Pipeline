import '../styles/globals.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function App({ Component, pageProps }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Component {...pageProps} />
      </div>
    </div>
  );
}
