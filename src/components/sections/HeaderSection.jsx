import styles from "./HeaderSection.module.css";

const HeaderSection = ({ header: { name, role, bio, location, available } }) => {
  return (
    <header className={styles.header}>
      <div className={styles.header_top}>
        <h1>{name}</h1>
        <p className={styles.subtitle}>{role}</p>
        <p className={styles.location}>{location}</p>
      </div>
      <p className={styles.bio}>{bio}</p>
      <div className={styles.status_info}>
        <span className={`${styles.status} ${available ? styles.open : styles.closed}`}>
          <span className={styles.status_dot}></span>
          {available ? "Open to opportunities" : "Not available"}
        </span>
      </div>
    </header>
  );
};

export default HeaderSection;
