// import SliderPage from 'react-slider-page';
import PageSlider from '../PageSlider';
import Home from '../Home';
import About from '../About';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import styles from './styles.module.css';
import Skills from '../Skills';
import Projects from '../Projects';
import { useEffect, useState } from 'react';

const Pages = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    const prismic = getPrismicClient();

    const getUser = async () => {
      const projects = await prismic.query(
        [Prismic.predicates.at('document.type', 'projects')],
        {
          fetch: [
            'projects.title',
            'projects.description',
            'projects.url',
            'projects.github',
          ],
          pageSize: 100,
        },
      );

      const projectsData = projects.results.map((project) => {
        return {
          slug: project.uid,
          title: RichText.asText(project.data.title),
          description: RichText.asText(project.data.description),
          url: RichText.asText(project.data.url),
          github: RichText.asText(project.data.github),
        };
      });

      const userInfo = await prismic.query(
        [Prismic.predicates.at('document.type', 'user-info')],
        {
          fetch: [
            'user-info.photo',
            'user-info.first-name',
            'user-info.last-name',
            'user-info.occupation',
            'user-info.photo',
            'user-info.location',
            'user-info.phone',
            'user-info.email',
            'user-info.github',
            'user-info.linkedin',
            'user-info.about',
            'user-info.skills',
          ],
          pageSize: 100,
        },
      );

      const userData = userInfo.results.map((user) => {
        return {
          slug: user.uid,
          firstName: RichText.asText(user.data['first-name']),
          lastName: RichText.asText(user.data['last-name']),
          occupation: RichText.asText(user.data.occupation),
          phone: RichText.asText(user.data.phone),
          photo: user.data.photo.url,
          location: RichText.asText(user.data.location),
          email: RichText.asText(user.data.email),
          github: RichText.asText(user.data.github),
          linkedin: RichText.asText(user.data.linkedin),
          about: RichText.asText(user.data.about),
          skillsList1: RichText.asText(user.data.skills[0].list).split(' '),
          skillsList2: RichText.asText(user.data.skills[1].list).split(' '),
          skillsList3: RichText.asText(user.data.skills[2].list).split(' '),
        };
      });

      setUser(userData);
      setProjects(projectsData);
    };

    getUser();
  }, []);

  return (
    <div className={styles.container}>
      <PageSlider>
        <div id="home">
          <Home user={user} />
        </div>
        <div id="about">
          <About user={user} />
        </div>
        <div id="skills">
          <Skills user={user} />
        </div>
        <div id="projects">
          <Projects projects={projects} />
        </div>
      </PageSlider>
    </div>
  );
};

export default Pages;
