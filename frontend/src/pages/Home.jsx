import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'

const Home = () => {
  return (
    <div className="-mt-2">
      <Hero />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      <div className="section-padding pt-0">
        <NewsletterBox />
      </div>
    </div>
  )
}

export default Home
