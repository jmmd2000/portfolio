import styles from "./EducationSection.module.css";

const EducationSection = ({ education }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Education</h2>
      <div className={styles.grid}>
        {education?.map((item, index) => (
          <div key={index} className={`${styles.card} card-with-blobs`}>
            <h3 className={styles.degree}>{item.degree}</h3>
            <p className={styles.institution}>{item.institution}</p>
            <div className={styles.details}>
              <p className={styles.period}>{item.period}</p>
              <p className={styles.grade}>{item.grade}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EducationSection;
