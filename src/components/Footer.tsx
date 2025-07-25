import Link from 'next/link';

const Footer = () => (
  <>
    <footer className="flex flex-col px-8 lg:px-24 pb-5 lg:pb-10 items-start">
      <div className="flex flex-col gap-y-[0] w-full">
        <h1 className="tracking-tight font-aeonik-bold text-[29px] md:text-[108px] leading-[110%]">CONTACT US</h1>
        <h1 className="tracking-tight font-aeonik-bold text-[29px] md:text-[78px] text-end leading-none">CONTACT@UNTITLEDTRADING.COM</h1>
        <p className="tracking-tight font-aeonik-regular text-[16px] md:text-[21px] text-center mt-10 opacity-60">© 2025 Untitled Trading. All rights reserved.</p>
      </div>
    </footer>
  </>
)
export default Footer