import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  const values = [
    { title: 'Quality Assurance', desc: 'Every product is carefully vetted to meet our high standards.' },
    { title: 'Convenience', desc: 'A seamless shopping experience from browse to delivery.' },
    { title: 'Customer First', desc: 'Dedicated support to ensure your complete satisfaction.' },
  ]

  return (
    <div>
      <Title
        text1="About"
        text2="Forever"
        subtitle="Born from a passion for timeless style and exceptional craftsmanship."
      />

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center mb-20">
        <div className="card overflow-hidden rounded-3xl">
          <img className="w-full object-cover" src={assets.about_img} alt="About Forever" />
        </div>
        <div className="space-y-5 text-brand-600 leading-relaxed">
          <p>
            Forever was born out of a passion for innovation and a desire to revolutionize the way people shop online. Our journey began with a simple idea: provide a platform where customers can easily discover and purchase quality products from the comfort of home.
          </p>
          <p>
            Since our inception, we've curated a diverse selection from trusted brands — from fashion and beauty to home essentials — all chosen with care.
          </p>
          <div className="card p-6 bg-brand-50 border-brand-100">
            <p className="eyebrow mb-2">Our Mission</p>
            <p className="text-brand-700">
              Empower customers with choice, convenience, and confidence through a shopping experience that exceeds expectations.
            </p>
          </div>
        </div>
      </div>

      <Title text1="Why" text2="Choose Us" className="!mb-10" />

      <div className="grid gap-6 sm:grid-cols-3 mb-20">
        {values.map((item) => (
          <div key={item.title} className="card p-8 hover:shadow-card transition-shadow">
            <h3 className="font-medium text-brand-900">{item.title}</h3>
            <p className="mt-3 text-sm text-brand-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <NewsletterBox />
    </div>
  )
}

export default About
