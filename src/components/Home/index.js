import styles from './styles.module.css';
import GithubIcon from '../GithubIcon';
import LinkedinIcon from '../LinkedinIcon';

const Home = () => {
  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        <img
          className={styles.avatar__image}
          src="https://rsdias-storage.s3.amazonaws.com/rafael.jpg"
          alt="Rafael Dias"
        />
      </div>

      <div className={styles.content}>
        <div className={styles.content__about}>
          <div className={styles.content__me}>
            <span className={styles['me__last-name']}>Dias</span>
            <h1 className={styles['me__first-name']}>Rafael</h1>
            <div className={styles.occupation}>
              <h2 className={styles.occupation__name}>Web Developer</h2>
            </div>
          </div>
          <div className={styles.social}>
            <a href="https://www.linkedin.com/in/rafaelsdiasdev/">
              <LinkedinIcon width="56px" height="56px" fill="#fff" />
            </a>
            <a href="https://github.com/rafaelsdiasdev">
              <GithubIcon width="56px" height="56px" fill="#fff" />
            </a>
          </div>
        </div>
        <ul className={styles.list}>
          <li className={styles.list__item}>
            <p className={styles.item__paragraph}>Location</p>
            <p className={styles.item__paragraph}>São Paulo</p>
          </li>
          <li className={styles.list__item}>
            <p className={styles.item__paragraph}>Phone</p>
            <p className={styles.item__paragraph}>(98) 981278401</p>
          </li>
          <li className={styles.list__item}>
            <p className={styles.item__paragraph}>Email</p>
            <p className={styles.item__paragraph}>contato@rafaelsdias.dev</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
