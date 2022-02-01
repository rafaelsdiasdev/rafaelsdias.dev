import { useRef } from 'react';
import ExpandMore from '../../images/expand_more.svg';
import GithubIcon from '../GithubIcon';
import Pin from '../Pin';
import styles from './styles.module.css';

const Projects = ({ projects }) => {
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
      <h1 className={styles.title}>Projects</h1>
      <ul className={styles.list}>
        {projects?.map((project) => (
          <li key={[project.slug]} className={styles.list__item}>
            <h2 className={styles.item__title}>{project.title}</h2>
            <p className={styles.item__paragraph}>{project.description}</p>
            <div className={styles.social}>
              <a href={project.github} rel="noreferrer noopener">
                <GithubIcon width="20px" height="20px" fill="#fff" />
              </a>
              {project.url.length === 0 ? (
                ''
              ) : (
                <a href={project.url} target="_blank" rel="noreferrer noopener">
                  <Pin width="20px" height="20px" fill="#fff" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
