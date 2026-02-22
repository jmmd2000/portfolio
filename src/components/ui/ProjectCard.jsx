import styles from "./ProjectCard.module.css";
import IconChip from "./IconChip";
import TECH_ICONS from "../../constants/techIcons";

const PLACEHOLDER_IMAGE = "https://placehold.co/800x450?text=Project+Image";

const ProjectCard = ({ title, description, imageURL, projectURL, liveURL, tags }) => {
  return (
    <div className={`${styles.card} card-with-blobs`}>
      <img src={imageURL || PLACEHOLDER_IMAGE} alt={title} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {tags && (
          <div className={styles.tags}>
            {tags.map(tag => (
              <IconChip key={tag} label={tag} icon={TECH_ICONS[tag.toLowerCase()]} />
            ))}
          </div>
        )}
        <div className={styles.links}>
          {projectURL && (
            <a href={projectURL} target="_blank" className={styles.link}>
              Source
            </a>
          )}
          {liveURL && (
            <a href={liveURL} target="_blank" className={styles.link}>
              Live
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
