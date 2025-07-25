"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import posthog from 'posthog-js';

import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet"

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY!, { api_host: 'https://us.i.posthog.com' });
}

const handleNavClick = (linkText: string) => {
  if (typeof window !== "undefined") {
    posthog.capture('navClicked', {
      page: linkText,
    });
  }
};

export const navLinks = [
  {
    text: "ABOUT",
    link: "/about",
  },
];

const Navbar = ({ minimal }: { minimal?: boolean }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
  
    handleResize();
  
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
  
    if (typeof window !== 'undefined') {
      if (isOpen) {
        window.addEventListener('click', handleClickOutside);
      }
  
      return () => {
        window.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isOpen]);
  
  const toggleNavBar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="fixed-header-container">
        <header className="z-50 fixed top-0 w-full flex items-center justify-between">
            <Link href={"/"}>
              <p className="font-aeonik-bold text-[21px] md:text-[18px] tracking-tighter text-white absolute left-8 top-8 transition duration-200 ease-in-out hover:text-blue-500">UNTITLED TRADING</p>
            </Link>
            {isMobile ? (
              <>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <div ref={hamburgerRef}>
                      <RxHamburgerMenu
                        className="absolute right-9 top-9 text-white text-[21px] cursor-pointer"
                        onClick={toggleNavBar}
                      />
                    </div>
                  </SheetTrigger>
                  <SheetContent
                  side="top"
                  ref={navRef}
                  className="bg-[#111111] border-none"
                  >
                    <div className="grid gap-4 p-6">
                      {navLinks.map((link) => (
                        <Link
                          className="text-start no-underline text-white text-[32px] font-graebenbach-mono-regular transition duration-200 ease-in-out hover:text-white tracking-normal"
                          href={link.link}
                          key={`${link.link} + ${link.text}`}
                          onClick={() => {
                            setIsOpen(false);
                            posthog.capture('mobileNavClicked', {
                              page: link.text,
                            });
                          }}
                        >
                          {link.text}
                        </Link>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <nav className="absolute right-8 top-8 flex flex-col items-end" ref={navRef}>
                {navLinks.map((link) => (
                  <Link
                    className="text-center no-underline text-[#ffffff80] text-base font-graebenbach-mono-regular transition duration-200 ease-in-out hover:text-white tracking-normal"
                    href={link.link}
                    key={`${link.link} + ${link.text}`}
                    onClick={() => handleNavClick(link.text)}
                  >
                    {link.text}
                  </Link>
                ))}
              </nav>
            )}
          </header>
      </div>
    </>
  );
};
export default Navbar;