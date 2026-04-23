import IconChip from "../ui/IconChip";
import TECH_ICONS from "../../constants/techIcons";
import styles from "./SkillsSection.module.css";

const SkillsSection = ({ skills }) => {
  console.log(skills.subtitle);
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Skills</h2>
      <p className={styles.subtitle}>{skills.subtitle}</p>
      <div className={styles.categories}>
        {Object.entries(skills.categories).map(([category, items]) => (
          <div key={category} className={styles.card}>
            <h3 className={styles.categoryLabel}>{category}</h3>
            <div className={styles.chips}>
              {items.map(skill => (
                <IconChip key={skill} icon={TECH_ICONS[skill.toLowerCase()]} label={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;
