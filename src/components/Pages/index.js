// import SliderPage from 'react-slider-page';
import PageSlider from '../PageSlider';
import Home from '../Home';
import About from '../About';

import styles from './styles.module.css';
import Skills from '../Skills';
import Projects from '../Projects';

const Pages = () => {
  return (
    <div className={styles.container}>
      <PageSlider>
        <div id="home">
          <Home />
        </div>
        <div id="about">
          <About />
        </div>
        <div id="skills">
          <Skills />
        </div>
        <div id="projects">
          <Projects />
        </div>
      </PageSlider>
    </div>
  );
};

export default Pages;
