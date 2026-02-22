import styles from "./HeaderSection.module.css";
import SocialButton from "../ui/SocialButton";

const HeaderSection = ({ header: { name, role, bio, location, available, socials } }) => {
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
          <span className={styles.status_dot} aria-hidden="true"></span>
          {available ? "Open to opportunities" : "Not available"}
        </span>
      </div>
      <div className={styles.socials}>
        {socials?.map(social => (
          <SocialButton
            key={social.name}
            href={social.url}
            label={social.name}
            icon={social.name.toLowerCase()}
          />
        ))}
      </div>
    </header>
  );
};

export default HeaderSection;
