import { useRef } from 'react';
import styles from './styles.module.css';
import GithubIcon from '../GithubIcon';
import LinkedinIcon from '../LinkedinIcon';
import ExpandMore from '../../images/expand_more.svg';
import Photo from '../../images/rafael.jpg';

const Home = ({ user }) => {
  const ref = useRef(null);

  const changeSlide = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        keyCode: 40,
      }),
    );
  };

  return (
    <>
      {user?.map((user) => (
        <div key={user.firstName} ref={ref} className={styles.container}>
          <div className={styles.avatar}>
            <img
              className={styles.avatar__image}
              src={Photo}
              alt={user.firstName}
            />
          </div>

          <div className={styles.content}>
            <div className={styles.content__about}>
              <div className={styles.content__me}>
                <span className={styles['me__last-name']}>{user.lastName}</span>
                <h1 className={styles['me__first-name']}>{user.firstName}</h1>
                <div className={styles.occupation}>
                  <h2 className={styles.occupation__name}>{user.occupation}</h2>
                </div>
              </div>
              <div className={styles.social}>
                <a href={user.linkedin}>
                  <LinkedinIcon width="56px" height="56px" fill="#fff" />
                </a>
                <a href={user.github}>
                  <GithubIcon width="56px" height="56px" fill="#fff" />
                </a>
              </div>
            </div>
            <ul className={styles.list}>
              <li className={styles.list__item}>
                <p className={styles.item__paragraph}>Location</p>
                <p className={styles.item__paragraph}>{user.location}</p>
              </li>
              <li className={styles.list__item}>
                <p className={styles.item__paragraph}>Phone</p>
                <p className={styles.item__paragraph}>{user.phone}</p>
              </li>
              <li className={styles.list__item}>
                <p className={styles.item__paragraph}>Email</p>
                <p className={styles.item__paragraph}>{user.email}</p>
              </li>
            </ul>
          </div>
          <div onClick={changeSlide} className={styles.scroll}>
            <img src={ExpandMore} alt="expand more" />
          </div>
        </div>
      ))}
    </>
  );
};

export default Home;
