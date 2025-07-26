import React, { FC } from 'react';
import Image from "next/image";
import Link from 'next/link';
import Button from '../../components/Button';
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { TracingBeam } from "../../components/ui/tracing-beam";
import InteractiveLink from './InteractiveLink';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';

export { metadata } from './metadata';

const team = [
  {
    name: "Giordan Masen",
    role: "Co-Founder, Business Lead & Quantitative Developer",
    desc: "Graduating at 16. Perfect SAT score. State physics champion (99%). Founded Acumen ($2.8M valuation). State debating champion.",
    year: "Co-Founder",
    quote: "The market doesn't care about your degree. It only respects results. We're here to take what's ours.",
    linkedin: "https://www.linkedin.com/in/gmasen/",
    instagram: "https://www.instagram.com/ggiordann/"
  },
  {
    name: "Ghazi Kazmi",
    role: "Co-Founder & Quantitative Developer",
    desc: "Perfect 100 in mathematics. Top 1% merit for AIF research project. Built multi-marketplace automation tool. Competitive math solver since 13.",
    year: "Co-Founder",
    quote: "Traditional finance is built on outdated systems. We're not here to improve them, we're here to replace them.",
    linkedin: "https://www.linkedin.com/in/ghazi-kazmi-3820ab263/",
    instagram: "https://www.instagram.com/gxxviik/"
  },
  {
    name: "Kalan Masen",
    role: "Lead Quantitative Researcher",
    desc: "Tied for #1 physics score in state (99%). State debating champion. Accelerated in Physics & Chemistry. ALL or NOTHING approach.",
    year: "Lead Quant",
    quote: "Money is the lifeblood of civilisation. Master its flow, and you master everything.",
    linkedin: "https://www.linkedin.com/in/kalan-masen-077698373/",
    instagram: "https://www.instagram.com/kalanmasen09/"
  },
  {
    name: "Asad Khan",
    role: "Design Lead",
    desc: "Graduating at 16. 2nd of 1500+ in Ignite scholarship. State debater of the year. First in state for citizen science design. A+ graphic design.",
    year: "Design Lead",
    quote: "Design isn't decoration, it's domination. Every pixel serves our purpose: total market conquest.",
    linkedin: "https://www.linkedin.com/in/asad-khan-37aa562a1/",
    instagram: "https://www.instagram.com/asad.esskay/"
  }
];

const achievements = [
  {
    name: "Seed Funding Interest",
    desc: "In talks with multiple VC firms for $398K AUD seed funding.",
    year: "2025",
  },
  {
    name: "Commercial Office Space",
    desc: "Pending contract for commercial office space in Adelaide's CBD.",
    year: "2025",
  },
  {
    name: "Backtesting Performance",
    desc: "Achieved 2.74 Sharpe ratio and 214% annualised returns in 30-day paper trading simulation.",
    year: "2025",
  },
  {
    name: "Full Agentic Automation",
    desc: "Built fully autonomous trading system replacing traditional quant teams with AI agents.",
    year: "2024",
  },
  {
    name: "Garage Beginnings",
    desc: "Started from a suburban garage with nothing but laptops and a whiteboard. Four teenagers coding from 6pm-4am fueled by a vision and Asad's cooking.",
    year: "2024",
  },
  {
    name: "Academic Excellence",
    desc: "Team maintains perfect 15.00 GPA with 10+ academic awards each.",
    year: "Ongoing",
  },
];

const About = () => {
  return (
    <>
      <Navbar />
      <div className="flex w-full flex-col pt-32 items-start">
        <div className="flex flex-col w-full px-8 md:px-22 lg:px-20 items-start justify-center text-6xl font-bold gap-y-4 ">
          <TracingBeam className="px-0 md:px-2">
            <div className="flex flex-col w-full align-center justify-center space-y-4 items-start">
              <Link href="/" className="w-full font-aeonik-thin tracking-regular space-y-3 text-sm mb-4">
                <p>← BACK TO HOME </p>
              </Link>
              <div className="flex flex-col w-full align-center justify-center space-y-4 items-center">
                <p className="w-full font-aeonik-bold tracking-tight text-center leading-[100%] text-[21px] mb-3">ABOUT </p>
                <h1 className="font-voyager-thin text-[44px] md:text-[54px] leading-[125%] text-center tracking-tight mb-3">The first AI-native quantitative trading firm</h1>
                <Image
                  priority
                  src="/design/Untitled.png"
                  height={300}
                  width={300}
                  alt="Untitled Trading Logo"
                  className="py-8"
                />
                <div className="w-full md:w-2/3 font-aeonik-thin tracking-[0.015em] space-y-10 items-center align-center justify-center text-[21px] md:text-[21px]">
                  <p className="leading-[150%]">We're four 16-year-old founders redefining quantitative trading through autonomous AI agents. While traditional firms like Citadel and Renaissance rely on thousands of employees, we've built a system that operates 24/7 with just servers and code.
                  </p>
                  <p className="leading-[150%]">Our journey began at a Jane Street recruiting event. Standing on our toes to blend in with university students, we discovered how mathematics and AI could transform finance. That night, we decided: why work for a quant firm when we could build a better one?
                  </p>
                  <p className="leading-[150%]">In just months, we've developed a fully autonomous trading pipeline using LLM-based agents coordinated through our proprietary Model Context Protocol. Our system connects to 20+ real-time APIs, processes everything from satellite data to news sentiment, and executes trades in milliseconds.
                  </p>
                  <p className="leading-[150%]">Our backtesting results speak for themselves: 2.74 Sharpe ratio, 214% annualised returns, outperforming industry giants with a fraction of their resources. We're not just building another trading algorithm; we're creating the first truly AI-native hedge fund.
                  </p>
                  <p className="leading-[150%]">Currently in talks with multiple VC firms for $398K AUD seed funding to transition from paper trading to live markets, with plans to obtain an Australian Financial Services License and scale globally. Our vision: prove that autonomous agents can consistently outperform traditional institutions.
                  </p>
                </div>
              </div>
            </div>
          <div className="flex flex-col w-full py-20">
            <p className="font-aeonik-thin tracking-widest text-[18px] border-b border-gray-400 pb-3">FOUNDING TEAM</p>
            {team.map((member, index) => (
              <div key={index} className="flex flex-col w-full border-b border-gray-800 py-10">
                <div className="flex flex-col md:flex-row justify-between md:items-start w-full">
                  <div className="w-full md:w-3/4">
                    <div className="flex items-center gap-4 mb-3">
                      <p className="font-voyager-thin tracking-tight text-[36px]">{member.name}</p>
                      <div className="flex gap-3">
                        <Link 
                          href={member.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <FaLinkedin size={20} />
                        </Link>
                        <Link 
                          href={member.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <FaInstagram size={20} />
                        </Link>
                      </div>
                    </div>
                    <p className="font-aeonik-medium text-[18px] mb-3 text-gray-300">{member.role}</p>
                    <p className="font-aeonik-thin text-gray-400 tracking-tight text-[18px] md:text-[21px] mb-3">{member.desc}</p>
                    <p className="font-aeonik-thin italic text-gray-500 tracking-tight text-[16px] md:text-[18px] mt-6">"{member.quote}"</p>
                  </div>
                  <p className="font-aeonik-thin tracking-tight text-[18px] md:text-[21px] mt-4 md:mt-0">{member.year}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full py-20">
              <p className="font-aeonik-thin tracking-widest text-[18px] border-b border-gray-400 pb-3">KEY MILESTONES</p>
              {achievements.map((achievement, index) => (
                  <div key={index} className="flex flex-col md:flex-row justify-between md:items-end w-full border-b border-gray-800 pt-10">
                      <div>
                          <p className="font-voyager-thin tracking-tight text-[36px] mb-3">{achievement.name}</p>
                          <p className="font-aeonik-thin text-gray-400 tracking-tight text-[18px] md:text-[21px] mb-3">{achievement.desc}</p>
                      </div>
                      <p className="font-aeonik-thin tracking-tight text-[18px] md:text-[21px] mb-3">{achievement.year}</p>
                  </div>
              ))}
          </div>
        </TracingBeam>
        </div>
      </div>
      <Footer/>
    </>
  );
};
export default About;