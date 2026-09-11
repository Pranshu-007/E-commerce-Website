import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const Contact = () => {
  return (
    <div>
      <Title
        text1="Contact"
        text2="Us"
        subtitle="We'd love to hear from you. Reach out anytime."
      />

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 mb-20">
        <div className="card overflow-hidden rounded-3xl">
          <img className="w-full object-cover" src={assets.contact_img} alt="Our store" />
        </div>

        <div className="flex flex-col justify-center gap-8">
          <div>
            <p className="eyebrow mb-2">Our Store</p>
            <p className="text-brand-700 leading-relaxed">
              Sector 01<br />
              Gurgaon, Haryana, India
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2">Contact</p>
            <p className="text-brand-700 leading-relaxed">
              Tel: +91 1234567890<br />
              Email: admin@forever.com
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2">Careers</p>
            <p className="text-brand-500 text-sm mb-4">
              Learn more about our teams and job openings.
            </p>
            <button type="button" className="btn-secondary">
              Explore Jobs
            </button>
          </div>
        </div>
      </div>

      <NewsletterBox />
    </div>
  )
}

export default Contact
