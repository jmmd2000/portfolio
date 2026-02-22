import styles from "./ExperienceCard.module.css";
import IconChip from "./IconChip";
import TECH_ICONS from "../../constants/techIcons";

const ExperienceCard = ({ title, company, period, description, tags, current, logoURL }) => {
  return (
    <div className={`${styles.card} card-with-blobs`}>
      <div className={styles.header}>
        {logoURL && (
          <img src={logoURL} alt={`${company} logo`} className={styles.logo} />
        )}
        <div className={styles.header_info}>
          <div>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.company_wrapper}>
              <p className={styles.company}>{company}</p>
              {current && <span className={styles.current}>Current</span>}
            </div>
          </div>
          <p className={styles.period}>{period}</p>
        </div>
      </div>
      {description && (
        <ul className={styles.description}>
          {description.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      {tags && (
        <div className={styles.tags}>
          {tags.map(tag => (
            <IconChip key={tag} label={tag} icon={TECH_ICONS[tag.toLowerCase()]} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceCard;
