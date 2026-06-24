import Header from "../components/landing/Header";
import Hero from "../components/landing/Hero";
import ProblemSolution from "../components/landing/ProblemSolution";
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import Testimonials from "../components/landing/Testimonials";
import Signup from "../components/landing/Signup";
import Footer from "../components/landing/Footer";
import "../../src/assets/styles/landing.css";


function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}

export default LandingPage;