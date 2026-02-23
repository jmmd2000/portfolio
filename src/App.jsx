import HeaderSection from "./components/sections/HeaderSection";
import SkillsSection from "./components/sections/SkillsSection";
import ProjectSection from "./components/sections/ProjectSection";
import ExperienceSection from "./components/sections/ExperienceSection";
import EducationSection from "./components/sections/EducationSection";
import data from "./data/content.json";

function App() {
  return (
    <main>
      <HeaderSection header={data.header} />
      <ProjectSection projects={data.projects} />
      <ExperienceSection experiences={data.experience} />
      <EducationSection education={data.education} />
      <SkillsSection skills={data.skills} />
    </main>
  );
}

export default App;
