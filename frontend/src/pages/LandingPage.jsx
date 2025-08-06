import { LandingNavbar } from "../components/LandingNavbar.jsx";
import LandingHero from "../components/LandingHero.jsx";
import LandingEdge from "../components/LandingEdge.jsx";
import LandingFeatures from "../components/LandingFeatures.jsx";
import LandingFooter from "../components/LandingFooter.jsx";

const Landing = () => {
  return (
      <div className="">
      <LandingNavbar />
      <LandingHero />
      <LandingEdge />
      <LandingFooter />
    </div>
  );
};

export default Landing;
