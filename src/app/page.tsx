import Navbar from "@/layout/Navbar";
import HomePage from "@/pages/HomePage";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="h-[100vh] pt-20">
        <HomePage />
      </div>
    </div>
  );
};

export default Home;
