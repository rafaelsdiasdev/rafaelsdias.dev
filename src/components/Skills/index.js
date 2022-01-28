import { useRef } from 'react';
import ExpandMore from '../../images/expand_more.svg';
import styles from './styles.module.css';

const Skills = () => {
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
          <p className={styles.item__paragraph}>Javascript ES6</p>
          <p className={styles.item__paragraph}>CSS3</p>
          <p className={styles.item__paragraph}>React</p>
          <p className={styles.item__paragraph}>Vue</p>
          <p className={styles.item__paragraph}>Styled Components</p>
        </li>
        <li className={styles.list__item}>
          <p className={styles.item__paragraph}>GraphQL</p>
          <p className={styles.item__paragraph}>MongoDB</p>
          <p className={styles.item__paragraph}>Postgress</p>
          <p className={styles.item__paragraph}>MySQL</p>
          <p className={styles.item__paragraph}>Amazon DynamoDB</p>
          <p className={styles.item__paragraph}>Storybook</p>
        </li>
        <li className={styles.list__item}>
          <p className={styles.item__paragraph}>Express</p>
          <p className={styles.item__paragraph}>Adonis.js</p>
          <p className={styles.item__paragraph}>AWS</p>
          <p className={styles.item__paragraph}>REST</p>
          <p className={styles.item__paragraph}>Next.js</p>
          <p className={styles.item__paragraph}>Sass</p>
          <p className={styles.item__paragraph}>Linux</p>
        </li>
      </ul>
    </div>
  );
};

export default Skills;
