import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import Stats from '../components/Stats'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

function Landing() {
  return (
    <main className="civic-app min-h-screen overflow-x-hidden bg-stone-50 text-slate-950">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Stats />
      <Testimonials />
      <Footer />
    </main>
  )
}

export default Landing
