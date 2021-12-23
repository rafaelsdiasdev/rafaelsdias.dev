import './styles/global.module.css';
import styles from './styles/App.module.css';
import Pages from './components/Pages'

function App() {
  return (
    <div className={`App ${styles.pageWrapper}`}>
      <Pages style={styles.pages} />
    </div>
  );
}

export default App;
