import { useState } from "react";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { MdEmail, MdCheck } from "react-icons/md";
import styles from "./SocialButton.module.css";

const ICONS = {
  github: SiGithub,
  linkedin: SiLinkedin,
  email: MdEmail,
};

const SocialButton = ({ href, icon, label }) => {
  const [copied, setCopied] = useState(false);
  const Icon = ICONS[icon];

  if (!Icon) return null;

  const isEmail = icon === "email" || !href?.startsWith("http");

  const handleEmailClick = e => {
    e.preventDefault();
    navigator.clipboard.writeText(href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isEmail) {
    return (
      <button
        onClick={handleEmailClick}
        className={`${styles.button} ${copied ? styles.copied : ""}`}
        aria-label={label || "Copy email"}
        title={copied ? "Copied!" : label}
      >
        <span className={styles.content}>
          <Icon />
          {label}
        </span>
        <span className={styles.checkmark}>
          <MdCheck />
          Copied!
        </span>
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      className={styles.button}
      aria-label={label || icon}
      title={label || icon}
    >
      <Icon />
      {label}
    </a>
  );
};

export default SocialButton;
