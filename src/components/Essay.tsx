import { useEffect, useRef, useState } from 'react'
import './Essay.css'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`${className} ${isVisible ? 'visible' : ''}`}>
      {children}
    </div>
  )
}

export function Essay() {
  return (
    <section className="essay-section" aria-labelledby="essay-title">
      <div className="essay-container">
        <ScrollReveal className="essay-header">
          <span className="essay-label">Manifesto</span>
          <h2 id="essay-title" className="essay-title">What is a Megadev?</h2>
          <p className="essay-author">by Sung</p>
        </ScrollReveal>

        <div className="essay-content">
          <ScrollReveal className="essay-paragraph intro" delay={100}>
            Hey Y'all! I'm Sung.
          </ScrollReveal>

          <ScrollReveal className="essay-paragraph" delay={200}>
            I recently bought the domain above and want to research in the open what it means
            to be a megadev (heavily inspired by megaman). I predict that we will enter into the
            age of guilds (think: team composition meta) across startups and consultants.
          </ScrollReveal>

          <ScrollReveal className="essay-paragraph" delay={300}>
            We're already seeing this with the job market zeitgeist in how the hottest startups
            are onboarding hires like{' '}
            <a
              href="https://joincolossus.com/article/inside-cursor/"
              target="_blank"
              rel="noopener noreferrer"
            >
              professional athletes
            </a>{' '}
            and{' '}
            <a
              href="https://www.humaninvariant.com/blog/titles"
              target="_blank"
              rel="noopener noreferrer"
            >
              status engineering
            </a>.
          </ScrollReveal>

          <ScrollReveal className="essay-highlight" delay={400}>
            <p>
              After witnessing the above role model stories take root, the general workforce
              will model after it with their own cultural power bottoms-up.
            </p>
          </ScrollReveal>

          <ScrollReveal className="essay-paragraph" delay={500}>
            It'll be through hyper-leverage tools and skills far beyond enmeshment with
            vendors (think: I know dbt, airflow, etc.). We're already seeing people leverage
            basic LLM chats as normal, simple agents, agentic workflows, and taking soft
            skills seriously (charisma and picking up idiosyncrasies are at a premium).
          </ScrollReveal>

          <ScrollReveal className="essay-paragraph" delay={600}>
            The most effective players will build a blend of technical AND social/emotional
            tools: automation improvements tightly coupled with reading people, a higher
            standard of design, and social engineering.
          </ScrollReveal>

          <ScrollReveal className="essay-highlight" delay={700}>
            <p>
              I'll build these open tools best used by me, available for all. They will be
              tightly coupled to my physical existence: encrypted data, chat history,
              reinforcement learning, and knowing the{' '}
              <a
                href="https://simonwillison.net/2025/Dec/2/claude-soul-document/"
                target="_blank"
                rel="noopener noreferrer"
              >
                soul
              </a>{' '}
              of the agents I build.
            </p>
          </ScrollReveal>

          <ScrollReveal className="essay-paragraph" delay={800}>
            I want you to fork and do the same. This isn't a novel prediction. These tools
            already exist in our gray matter. We now have the infrastructure to codify them.
          </ScrollReveal>

          <ScrollReveal className="essay-paragraph" delay={900}>
            I believe this will happen whether I'm a bystander or in the mess.
          </ScrollReveal>

          <ScrollReveal className="essay-closing" delay={1000}>
            <p>I love a good mess.</p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
