import { useRef } from 'react';
import styles from './styles.module.css';
import GithubIcon from '../GithubIcon';
import LinkedinIcon from '../LinkedinIcon';
import ExpandMore from '../../images/expand_more.svg';
import Photo from '../../images/rafael.jpg';

const Home = () => {
  const ref = useRef(null);

  const changeSlide = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        keyCode: 40,
      }),
    );
  };

  return (
    <div ref={ref} className={styles.container}>
      <div className={styles.avatar}>
        <img className={styles.avatar__image} src={Photo} alt="Rafael Dias" />
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
            <p className={styles.item__paragraph}>(98) 98127-8401</p>
          </li>
          <li className={styles.list__item}>
            <p className={styles.item__paragraph}>Email</p>
            <p className={styles.item__paragraph}>contato@rafaelsdias.dev</p>
          </li>
        </ul>
      </div>
      <div onClick={changeSlide} className={styles.scroll}>
        <img src={ExpandMore} alt="expand more" />
      </div>
    </div>
  );
};

export default Home;
