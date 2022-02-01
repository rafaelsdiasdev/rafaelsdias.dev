import { useRef } from 'react';
import ExpandMore from '../../images/expand_more.svg';
import styles from './styles.module.css';

const Skills = ({ user }) => {
  const ref = useRef(null);

  const changeSlide = (key) => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        keyCode: key,
      }),
    );
  };

  return (
    <div ref={ref} className={styles.container}>
      <div onClick={() => changeSlide(38)} className={styles.scrollUp}>
        <img src={ExpandMore} alt="expand more" />
      </div>
      <div onClick={() => changeSlide(40)} className={styles.scrollDown}>
        <img src={ExpandMore} alt="expand more" />
      </div>
      <h1 className={styles.title}>Skills</h1>
      <ul className={styles.list}>
        <li className={styles.list__item}>
          {user?.map((user) =>
            user.skillsList1.map((skill, idx) => (
              <p key={idx} className={styles.item__paragraph}>
                {skill}
              </p>
            )),
          )}
        </li>
        <li className={styles.list__item}>
          {user?.map((user) =>
            user.skillsList2.map((skill, idx) => (
              <p key={idx} className={styles.item__paragraph}>
                {skill}
              </p>
            )),
          )}
        </li>
        <li className={styles.list__item}>
          {user?.map((user) =>
            user.skillsList3.map((skill, idx) => (
              <p key={idx} className={styles.item__paragraph}>
                {skill}
              </p>
            )),
          )}
        </li>
      </ul>
    </div>
  );
};

export default Skills;
