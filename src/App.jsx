import HeaderSection from "./components/sections/HeaderSection";
import ProjectSection from "./components/sections/ProjectSection";
import ExperienceSection from "./components/sections/ExperienceSection";
import data from "./data/content.json";

function App() {
  return (
    <main>
      <HeaderSection header={data.header} />
      <ProjectSection projects={data.projects} />
      <ExperienceSection experiences={data.experience} />
    </main>
  );
}

export default App;
