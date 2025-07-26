import Link from 'next/link';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const SocialIcons = () => {
  return (
    <div className="fixed right-8 bottom-8 flex flex-col gap-6 z-50">
      <Link 
        href="https://x.com/UntitledTrading" 
        target="_blank" 
        rel="noopener noreferrer"
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <FaXTwitter size={20} />
      </Link>
      
      <Link 
        href="https://www.instagram.com/untitledtrading/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <FaInstagram size={20} />
      </Link>
      
      <Link 
        href="https://www.linkedin.com/company/untitled-trading/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <FaLinkedin size={20} />
      </Link>
    </div>
  );
};

export default SocialIcons;