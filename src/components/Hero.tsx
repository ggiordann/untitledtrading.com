"use client";

import React, { useEffect, FC, useRef, useState } from 'react';
import Image from "next/image";
import Link from 'next/link';
import Button from './Button';
import Marquee from "react-fast-marquee";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import posthog from 'posthog-js';
import { CardSpotlight } from "@/src/components/ui/card-spotlight";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY!, { api_host: 'https://us.i.posthog.com' });
}

const handleProjClick = (projectName: string, projectLink: string, eventType: string) => {
  if (typeof window !== "undefined") {
    posthog.capture(eventType, {
      name: projectName,
      url: projectLink
    });
  }
};

const handleProjButtomClick = () => {
  if (typeof window !== "undefined") {
    posthog.capture('viewProjectsClicked', {property: 'value'});
  }
};

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const videoElement = videoRef.current;

    const handleCanPlay = () => {
      if (videoElement) {
        videoElement.play().catch((error) => {
          console.warn('Video autoplay was prevented:', error);
        });
      }
    };

    if (videoElement) {
      videoElement.addEventListener('canplay', handleCanPlay);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, []);

  const blur = 5;
  const videoSource = "home/static.mp4";
  
  return (
    <>
      <main className="flex min-h-screen w-full flex-col items-center justify-center py-8 md:py-12 lg:py-16">
        <div className="z-[-1] w-full h-full bg-black flex items-center justify-center absolute top-0">
            {isMounted && (
              <video
                className="absolute top-0 left-0 w-full object-cover"
                style={{ filter: `blur(${blur}px)`, WebkitFilter: `blur(${blur}px)` }}
                autoPlay
                loop
                muted
                playsInline
                id="video-id"
                ref={videoRef}
              >
              <source src={videoSource} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            )}
        </div>
        <div className="flex flex-col w-full max-w-[900px] mx-auto mt-14 md:mt-0 lg:pt-0 p-4 md:p-0 lg:p-0 justify-center text-6xl font-bold gap-y-32">
          <div className="flex flex-row w-full space-x-1 mt-24">
            <div className="self-start mt-3">
              <h1 className="tracking-tight font-voyager-thin text-[16px] md:text-[14px] lg:text-[14px] mr-1">►</h1>
            </div>
            <div className="flex flex-col w-full align-center justify-center space-y-6 md:space-y-6 items-start">
              <div className="flex flex-row w-full mb-3 items-center">
                <h1 className="tracking-tight font-voyager-thin text-[48px] md:text-[42px] lg:text-[42px]">UNTITLED TRADING</h1>
              </div>
              <div className="w-full font-aeonik-regular space-y-8 leading-[1.5] text-[21px] md:text-[18px] lg:text-[18px]">
                <p>AI-native prediction market infrastructure.</p>
                <p>We're building real-time systems for prediction markets.</p>
                <p>Operating at the intersection of markets, technology, and AI-driven research.</p>
                <p>contact: <Link href="mailto:contact@untitledtrading.com" className="border-b italic hover:text-blue-500 transition-all duration-300 hover:border-blue-500">contact@untitledtrading.com</Link></p>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full space-y-3 px-5">
            <h1 className="tracking-tight font-voyager-thin text-[21px] pb-8">key metrics</h1>
            <div className="flex flex-col pb-20 md:pb-0 pt-6 md:pt-0 lg:pt-0 sm:flex-row w-full space-y-3 md:space-y-0 md:space-x-4">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 w-full">
                <CardSpotlight 
                  className="flex-1 opacity-80 hover:opacity-100 transition-all duration-300 rounded-xl border border-[#ffffff33] p-4 space-y-2 bg-black h-[6.5rem] md:h-40">
                  <div className="flex flex-row w-full justify-between items-center">
                    <p className="font-aeonik-medium text-[18px]">mean latency</p>
                  </div>
                  <p className="font-aeonik-bold text-[36px]">18ms</p>
                  <p className="opacity-70 font-aeonik-regular text-[14px] leading-[130%]">
                    internal system response time
                  </p>
                </CardSpotlight>
                <CardSpotlight 
                  className="flex-1 opacity-80 hover:opacity-100 transition-all duration-300 rounded-xl border border-[#ffffff33] p-4 space-y-2 bg-black h-[6.5rem] md:h-40">
                  <div className="flex flex-row w-full justify-between items-center">
                    <p className="font-aeonik-medium text-[18px]">market index</p>
                  </div>
                  <p className="font-aeonik-bold text-[36px]">10K+</p>
                  <p className="opacity-70 font-aeonik-regular text-[14px] leading-[130%]">
                    market and event records indexed
                  </p>
                </CardSpotlight>
                <CardSpotlight 
                  className="flex-1 opacity-80 hover:opacity-100 transition-all duration-300 rounded-xl border border-[#ffffff33] p-4 space-y-2 bg-black h-[6.5rem] md:h-40">
                  <div className="flex flex-row w-full justify-between items-center">
                    <p className="font-aeonik-medium text-[18px]">data throughput</p>
                  </div>
                  <p className="font-aeonik-bold text-[36px]">420K+</p>
                  <p className="opacity-70 font-aeonik-regular text-[14px] leading-[130%]">
                    market events processed across internal systems
                  </p>
                </CardSpotlight>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-4 px-5">
            <h1 className="tracking-tight font-voyager-thin text-[21px]">learn more</h1>
            <div className="flex flex-col pb-20 md:pb-0 pt-6 md:pt-0 lg:pt-0 sm:flex-row w-full space-y-3 md:space-y-0 md:space-x-4">
              <Button
                text="MANIFESTO"
                link="/manifesto"
                className="w-full text-center md:text-left sm:w-auto"
                event={`'manifestoClicked', {property: 'value'}`}
              ></Button>
              <Button 
                text="ABOUT"
                link="/about"
                className="w-full text-center md:text-left sm:w-auto"
                event={`'aboutClicked', {property: 'value'}`}
              ></Button>
              <Button 
                text="CAREERS"
                link="/careers"
                className="w-full text-center md:text-left sm:w-auto"
                event={`'careersClicked', {property: 'value'}`}
              ></Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
export default Hero;
