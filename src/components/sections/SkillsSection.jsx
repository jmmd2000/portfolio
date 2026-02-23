import IconChip from "../ui/IconChip";
import TECH_ICONS from "../../constants/techIcons";
import styles from "./SkillsSection.module.css";

const SkillsSection = ({ skills }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Skills</h2>
      <div className={styles.categories}>
        {Object.entries(skills).map(([category, items]) => (
          <div key={category} className={`${styles.card} card-with-blobs`}>
            <h3 className={styles.categoryLabel}>{category}</h3>
            <div className={styles.chips}>
              {items.map((skill) => (
                <IconChip
                  key={skill}
                  icon={TECH_ICONS[skill.toLowerCase()]}
                  label={skill}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;
