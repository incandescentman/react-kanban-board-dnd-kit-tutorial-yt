import "./App.css";
import KanbanBoard from "./components/KanbanBoard";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <KanbanBoard />
    </ErrorBoundary>
  );
}

export default App;
