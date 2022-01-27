import GithubIcon from '../GithubIcon';
import Pin from '../Pin';
import styles from './styles.module.css';

const Projects = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Projects</h1>
      <ul className={styles.list}>
        <li className={styles.list__item}>
          <h2 className={styles.item__title}>Spotify Clone</h2>
          <p className={styles.item__paragraph}>
            Spotify clone developed in React, Styled Components and Storybook,
            hosted on AWS S3 and CloudFront.
          </p>
          <div className={styles.social}>
            <a
              href="https://github.com/rafaelsdiasdev/spotify-clone"
              rel="noreferrer noopener"
            >
              <GithubIcon width="20px" height="20px" fill="#fff" />
            </a>
            <a
              href="https://spotify.rafaelsdias.dev"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Pin width="20px" height="20px" fill="#fff" />
            </a>
          </div>
        </li>
        <li className={styles.list__item}>
          <h2 className={styles.item__title}>Text-to-Speech </h2>
          <p className={styles.item__paragraph}>
            App as a "text-to-speech" demonstration using IBM Wattson.
          </p>
          <div className={styles.social}>
            <a
              href="https://github.com/rafaelsdiasdev/text-to-speech"
              rel="noreferrer noopener"
            >
              <GithubIcon width="20px" height="20px" fill="#fff" />
            </a>
          </div>
        </li>
        <li className={styles.list__item}>
          <h2 className={styles.item__title}>Ranek</h2>
          <p className={styles.item__paragraph}>
            Study app using Vue.js and Wordpress
          </p>
          <div className={styles.social}>
            <a
              href="https://github.com/rafaelsdiasdev/Ranek"
              rel="noreferrer noopener"
            >
              <GithubIcon width="20px" height="20px" fill="#fff" />
            </a>
          </div>
        </li>

        <li className={styles.list__item}>
          <h2 className={styles.item__title}>Coffee&Book</h2>
          <p className={styles.item__paragraph}>
            Basic project that searches for establishments and shows their
            location on Google Maps. Stack: used: - JavaScript ES6 + - Express -
            Mongoose - Ajax - Axios - Google Maps Api - Cloudinary - Deploying
            database using Heroku MongoLab Addon.
          </p>
          <div className={styles.social}>
            <a
              href="https://github.com/rafaelsdiasdev/find-coffee-books"
              target="_blank"
              rel="noreferrer noopener"
            >
              <GithubIcon width="20px" height="20px" fill="#fff" />
            </a>
            <a
              href="http://find-coffee-books.herokuapp.com/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Pin width="20px" height="20px" fill="#fff" />
            </a>
          </div>
        </li>

        <li className={styles.list__item}>
          <h2 className={styles.item__title}>Genki Food</h2>
          <p className={styles.item__paragraph}>
            In this project we made a fictitious frozen food company. - Stack
            used: Express, HBS, MongoGB, JS, Node.
          </p>
          <div className={styles.social}>
            <a
              href="https://rafaelsdias.dev"
              target="_blank"
              rel="noreferrer noopener"
            >
              <GithubIcon width="20px" height="20px" fill="#fff" />
            </a>
            <a
              href="http://grupo-4.herokuapp.com/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Pin width="20px" height="20px" fill="#fff" />
            </a>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Projects;
