import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="bg-dark min-vh-100 text-light">
      <Navbar />
      <main className="py-4">
        <div className="container">
          <AppRoutes />
        </div>
      </main>
    </div>
  );
}

export default App;
