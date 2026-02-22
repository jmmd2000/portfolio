import styles from "./ProjectSection.module.css";
import ProjectCard from "../ui/ProjectCard";

const ProjectSection = ({ projects }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Projects</h2>
      <div className={styles.grid}>
        {projects?.map(project => (
          <ProjectCard
            key={project.id}
            title={project.title}
            description={project.description}
            imageURL={project.imageURL}
            projectURL={project.projectURL}
            liveURL={project.liveURL}
            tags={project.tags}
          />
        ))}
      </div>
    </section>
  );
};

export default ProjectSection;
