import React from 'react';
import { Globe, Twitter, MessageCircle } from 'lucide-react';

interface SocialIconsProps {
  website?: string;
  x?: string;
  discord?: string;
  telegram?: string;
}

export const SocialIcons: React.FC<SocialIconsProps> = ({ website, x, discord, telegram }) => {
  const baseClasses = "p-2 rounded-lg transition-colors";
  const activeClasses = "bg-black/30 hover:bg-black/40 text-yellow-600";
  const inactiveClasses = "bg-black/10 cursor-not-allowed opacity-30 text-yellow-600";

  return (
    <div className="flex gap-2">
      <a
        href={website}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${website ? activeClasses : inactiveClasses}`}
      >
        <Globe size={20} />
      </a>
      <a
        href={x}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${x ? activeClasses : inactiveClasses}`}
      >
        <Twitter size={20} />
      </a>
      <a
        href={discord}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${discord ? activeClasses : inactiveClasses}`}
      >
        <MessageCircle size={20} />
      </a>
      <a
        href={telegram}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${telegram ? activeClasses : inactiveClasses}`}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-5 h-5"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 3.845-1.362 5.122l-.03.09c-.28 1.062-.45 1.402-.75 1.732-.43.47-1.022.467-1.492.287-.46-.177-1.44-.526-2.25-.836-.91-.348-1.62-.624-2.34-.968-.66-.317-1.71-.892-1.71-1.892 0-.47.15-.892.63-1.282 1.14-.927 2.49-2.122 3.75-3.122 1.26-1 2.49-2.102 3.75-3.122.16-.13.34-.27.34-.47 0-.09-.06-.18-.15-.21-.09-.03-.21-.03-.3.03-1.8 1.13-3.57 2.28-5.37 3.43-1.8 1.15-3.66 2.27-5.46 3.42-.18.12-.39.15-.6.15-.18 0-.36-.03-.54-.09-1.02-.33-2.01-.69-3.03-1.02-.51-.167-.99-.347-1.47-.527-.18-.06-.36-.15-.45-.33-.09-.18-.06-.39.06-.54.36-.45.75-.87 1.14-1.29.39-.42.78-.84 1.17-1.26.06-.06.12-.12.21-.15.09-.03.18 0 .24.06 1.8 1.13 3.57 2.28 5.37 3.43 1.8 1.15 3.66 2.27 5.46 3.42.18.12.39.15.6.15.18 0 .36-.03.54-.09 1.02-.33 2.01-.69 3.03-1.02.51-.167.99-.347 1.47-.527.18-.06.36-.15.45-.33.09-.18.06-.39-.06-.54-.36-.45-.75-.87-1.14-1.29-.39-.42-.78-.84-1.17-1.26-.06-.06-.12-.12-.21-.15-.09-.03-.18 0-.24.06z"/>
        </svg>
      </a>
    </div>
  );
};