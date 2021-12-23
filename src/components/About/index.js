import React from 'react';
import styles from './styles.module.css';

const About = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>What I am all about.</h1>
      <p className={styles.paragraph}>
        Graduated in Web Development by Ironhack São Paulo, graduating in
        Computer Engineering with a specialization in software from Instituto
        Infnet RJ, graduated in Interior Design from UniCeuma MA, curious, I
        love exploring new technologies.
      </p>
    </div>
  );
};

export default About;
