import HeaderSection from "./components/sections/HeaderSection";
import data from "./data/content.json";

function App() {
  return (
    <main>
      <HeaderSection header={data.header} />
    </main>
  );
}

export default App;
