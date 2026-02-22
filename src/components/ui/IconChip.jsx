import styles from "./IconChip.module.css";

const IconChip = ({ icon: Icon, label, onClick }) => {
  return (
    <div className={styles.chip} onClick={onClick}>
      {Icon && <Icon className={styles.icon} />}
      <span>{label}</span>
    </div>
  );
};

export default IconChip;
