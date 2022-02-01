import { useRef } from 'react';
import ExpandMore from '../../images/expand_more.svg';
import styles from './styles.module.css';

const About = ({ user }) => {
  const ref = useRef(null);

  const changeSlide = (key) => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        keyCode: key,
      }),
    );
  };
  return (
    <>
      {user?.map((user) => (
        <div key={user.firstName} ref={ref} className={styles.container}>
          <h1 className={styles.title}>What I am all about.</h1>
          <p className={styles.paragraph}>{user.about}</p>
          <div onClick={() => changeSlide(38)} className={styles.scrollUp}>
            <img src={ExpandMore} alt="expand more" />
          </div>
          <div onClick={() => changeSlide(40)} className={styles.scrollDown}>
            <img src={ExpandMore} alt="expand more" />
          </div>
        </div>
      ))}
    </>
  );
};

export default About;
