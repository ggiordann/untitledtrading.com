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
    role: "Founder & Researcher",
    year: "Founder",
    linkedin: "https://www.linkedin.com/in/gmasen/",
    instagram: "https://www.instagram.com/ggiordann/"
  },
  {
    name: "Aditya Payanadan",
    role: "Trader & Developer",
    year: "Research",
    linkedin: "https://www.linkedin.com/in/apayanadan/",
    instagram: "https://www.instagram.com/ad1tya_payanadan/"
  },
  {
    name: "Jin Xing",
    role: "Trader & Researcher",
    year: "Research",
    linkedin: "https://www.linkedin.com/in/jin-xing-8bb72a406/",
    instagram: "https://www.instagram.com/sterhamms/"
  },
  {
    name: "Ghazi Kazmi",
    role: "Founder & Developer",
    year: "Founder",
    linkedin: "https://www.linkedin.com/in/ghazi-kazmi-3820ab263/",
    instagram: "https://www.instagram.com/gxxviik/"
  },
  {
    name: "Kalan Masen",
    role: "Researcher",
    year: "Research",
    linkedin: "https://www.linkedin.com/in/kalan-masen-077698373/",
    instagram: "https://www.instagram.com/kalanmasen09/"
  },
  {
    name: "Asad Khan",
    role: "Design Lead",
    year: "Design Lead",
    linkedin: "https://www.linkedin.com/in/asad-khan-37aa562a1/",
    instagram: "https://www.instagram.com/asad.webp/"
  }
];

const achievements = [
  {
    name: "Company Founded",
    desc: "Started building internal systems for market intelligence and research.",
    year: "2025",
  },
  {
    name: "Live Market Systems",
    desc: "Built real-time data and monitoring infrastructure.",
    year: "2025",
  },
  {
    name: "Prediction Market Infrastructure",
    desc: "Expanding quantitative models, tooling, and workflows across prediction markets.",
    year: "2026",
  },
];

const About = () => {
  return (
    <>
      <Navbar />
      <div className="flex w-full flex-col pt-32 items-start">
        <div className="flex flex-col w-full px-8 md:px-[5.5rem] lg:px-20 items-start justify-center text-6xl font-bold gap-y-4 ">
          <TracingBeam className="px-0 md:px-2">
            <div className="flex flex-col w-full align-center justify-center space-y-4 items-start">
              <Link href="/" className="w-full font-aeonik-thin tracking-normal space-y-3 text-sm mb-4">
                <p>← BACK TO HOME </p>
              </Link>
              <div className="flex flex-col w-full align-center justify-center space-y-4 items-center">
                <p className="w-full font-aeonik-bold tracking-tight text-center leading-[100%] text-[21px] mb-3">ABOUT </p>
                <h1 className="font-voyager-thin text-[44px] md:text-[54px] leading-[125%] text-center tracking-tight mb-3">AI-native prediction market infrastructure</h1>
                <Image
                  priority
                  src="/design/Untitled.png"
                  height={300}
                  width={300}
                  alt="Untitled Trading Logo"
                  className="py-8"
                />
                <div className="w-full md:w-2/3 font-aeonik-thin tracking-[0.015em] space-y-10 items-center align-center justify-center text-[21px] md:text-[21px]">
                  <p className="leading-[150%]">We're building real-time infrastructure for prediction markets.
                  </p>
                  <p className="leading-[150%]">Our systems are designed to support market intelligence, quantitative research, and disciplined execution at scale.
                  </p>
                  <p className="leading-[150%]">Currently expanding the team across engineering, research and trading.
                  </p>
                </div>
              </div>
            </div>
          <div className="flex flex-col w-full py-20">
            <p className="font-aeonik-thin tracking-widest text-[18px] border-b border-gray-400 pb-3">TEAM</p>
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
