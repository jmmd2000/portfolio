import HeaderSection from "./components/sections/HeaderSection";
import ProjectSection from "./components/sections/ProjectSection";
import data from "./data/content.json";

function App() {
  return (
    <main>
      <HeaderSection header={data.header} />
      <ProjectSection projects={data.projects} />
    </main>
  );
}

export default App;
