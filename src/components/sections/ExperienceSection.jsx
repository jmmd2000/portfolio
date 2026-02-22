import styles from "./ExperienceSection.module.css";
import ExperienceCard from "../ui/ExperienceCard";

const ExperienceSection = ({ experiences }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Experience</h2>
      <div className={styles.list}>
        {experiences?.map((experience, index) => (
          <ExperienceCard
            key={index}
            title={experience.title}
            company={experience.company}
            period={experience.period}
            description={experience.description}
            tags={experience.tags}
            current={experience.current}
          />
        ))}
      </div>
    </section>
  );
};

export default ExperienceSection;
