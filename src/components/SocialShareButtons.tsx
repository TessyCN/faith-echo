import { Facebook, Twitter, MessageCircle } from "lucide-react";

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description: string;
}

const SocialShareButtons = ({ url, title, description }: SocialShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      color: "hover:text-[#1877F2]",
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:text-foreground",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:text-[#25D366]",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors ${link.color}`}
          aria-label={`Share on ${link.name}`}
        >
          <link.icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
};

export default SocialShareButtons;
