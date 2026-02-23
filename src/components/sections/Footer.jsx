import { MdArrowUpward } from "react-icons/md";
import styles from "./Footer.module.css";

const Footer = () => {
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer}>
      <a href="#" onClick={scrollToTop} className={styles.link}>
        <MdArrowUpward /> Back to top <MdArrowUpward />
      </a>
    </footer>
  );
};

export default Footer;
