'use client';

import React, { FC } from 'react';
import Image from "next/image";
import Link from 'next/link';
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { TracingBeam } from "../../components/ui/tracing-beam";
import JobApplicationModal from './JobApplicationModal';
import { CardSpotlight } from "../../components/ui/card-spotlight";

const jobs = [
  {
    id: "founding-engineer",
    title: "Founding Engineer",
    type: "Full-time",
    location: "Adelaide, AU / Remote",
    shortDescription: "Build the future of autonomous trading as a founding engineer.",
    keyPoints: [
      "Architect core trading infrastructure",
      "Work directly with founders",
      "Significant equity stake",
      "Shape technical direction"
    ]
  },
  {
    id: "quant-researcher-intern",
    title: "Quantitative Researcher Intern",
    type: "Internship (3-6 months)",
    location: "Adelaide, AU / Remote",
    shortDescription: "Research and develop cutting-edge trading strategies with our AI models.",
    keyPoints: [
      "Develop trading strategies",
      "Work with AI/ML models",
      "Flexible university hours",
      "Path to full-time role"
    ]
  }
];

const Careers = () => {
  const [selectedJob, setSelectedJob] = React.useState<typeof jobs[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleApply = (job: typeof jobs[0]) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="flex w-full flex-col pt-32 items-center">
        <div className="flex flex-col w-full px-8 md:px-22 lg:px-20 items-center justify-center text-6xl font-bold gap-y-4">
          <div className="relative w-full max-w-5xl">
          <TracingBeam className="px-0 md:px-2">
            <div className="flex flex-col w-full align-center justify-center space-y-4 items-start">
              <Link href="/" className="w-full font-aeonik-thin tracking-regular space-y-3 text-sm mb-4">
                <p>← BACK TO HOME </p>
              </Link>
              <div className="flex flex-col w-full align-center justify-center space-y-4 items-center">
                <p className="w-full font-aeonik-bold tracking-tight text-center leading-[100%] text-[21px] mb-3">CAREERS</p>
                <h1 className="font-voyager-thin text-[44px] md:text-[54px] leading-[125%] text-center tracking-tight mb-3">Join the revolution in quantitative trading</h1>
                <div className="w-full md:w-2/3 font-aeonik-thin tracking-[0.015em] space-y-10 items-center align-center justify-center text-[21px] md:text-[21px]">
                  <p className="leading-[150%] text-center">We're looking for exceptional individuals who share our vision of transforming finance through AI. Join our founding team and help build the future of autonomous trading.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full py-20">
              <p className="font-aeonik-thin tracking-widest text-[18px] border-b border-gray-400 pb-3 mb-10">OPEN POSITIONS</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {jobs.map((job, index) => (
                  <CardSpotlight 
                    key={job.id}
                    className="p-6 h-full flex flex-col justify-between rounded-2xl relative"
                  >
                    <div>
                      <div className="flex flex-row justify-between items-start mb-4">
                        <h3 className="font-aeonik-medium text-[24px]">{job.title}</h3>
                      </div>
                      
                      <div className="flex flex-row gap-3 text-gray-400 text-[14px] mb-4">
                        <span>{job.type}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                      
                      <p className="font-aeonik-regular text-[16px] text-gray-300 mb-6">
                        {job.shortDescription}
                      </p>
                      
                      <ul className="space-y-2 mb-6">
                        {job.keyPoints.map((point, idx) => (
                          <li key={idx} className="font-aeonik-thin text-[14px] text-gray-400 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleApply(job)}
                      className="w-full border border-white transition duration-500 cursor-pointer ease-in-out hover:bg-blue-600 hover:border-blue-600 rounded-xl h-10 px-8 py-2 relative z-20"
                    >
                      <p className="text-sm font-graebenbach-mono-regular">APPLY NOW</p>
                    </button>
                  </CardSpotlight>
                ))}
              </div>
            </div>

            <div className="flex flex-col w-full pb-20">
              <p className="font-aeonik-thin tracking-widest text-[18px] border-b border-gray-400 pb-3 mb-10">WHY JOIN US?</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="text-center">
                  <p className="font-voyager-thin text-[48px] mb-2">16</p>
                  <p className="font-aeonik-thin text-[14px] text-gray-400">Average founder age</p>
                </div>
                <div className="text-center">
                  <p className="font-voyager-thin text-[48px] mb-2">2.74</p>
                  <p className="font-aeonik-thin text-[14px] text-gray-400">Sharpe ratio achieved</p>
                </div>
                <div className="text-center">
                  <p className="font-voyager-thin text-[48px] mb-2">24/7</p>
                  <p className="font-aeonik-thin text-[14px] text-gray-400">Autonomous trading</p>
                </div>
                <div className="text-center">
                  <p className="font-voyager-thin text-[48px] mb-2">∞</p>
                  <p className="font-aeonik-thin text-[14px] text-gray-400">Growth potential</p>
                </div>
              </div>
            </div>
          </TracingBeam>
          </div>
        </div>
      </div>
      <Footer/>
      
      <JobApplicationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={selectedJob}
      />
    </>
  );
};

export default Careers;