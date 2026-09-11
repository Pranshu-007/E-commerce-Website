import ScrollReveal from './ScrollReveal'
import AnimatedIcon from './AnimatedIcon'

const policies = [
  {
    icon: 'exchange',
    title: 'Easy Exchange',
    desc: 'Hassle-free exchanges within 7 days on eligible items.',
  },
  {
    icon: 'quality',
    title: '7-Day Returns',
    desc: 'Not the right fit? Return within a week, no questions asked.',
  },
  {
    icon: 'support',
    title: '24/7 Support',
    desc: 'Our team is always here to help with orders and styling advice.',
  },
]

const OurPolicy = () => {
  return (
    <section className="section-padding">
      <ScrollReveal
        className="grid gap-6 sm:grid-cols-3"
        stagger={0.1}
        start="top 90%"
      >
        {policies.map((policy) => (
          <div
            key={policy.title}
            className="card flex flex-col items-center text-center p-8 transition-shadow hover:shadow-card"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
              <AnimatedIcon name={policy.icon} size="lg" strokeColor="#57534e" />
            </div>
            <h3 className="font-medium text-brand-900">{policy.title}</h3>
            <p className="mt-2 text-sm text-brand-500 leading-relaxed">{policy.desc}</p>
          </div>
        ))}
      </ScrollReveal>
    </section>
  )
}

export default OurPolicy
