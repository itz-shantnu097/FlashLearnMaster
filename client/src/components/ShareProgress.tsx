import React, { useState } from 'react';
import { 
  FacebookShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton, TelegramShareButton,
  FacebookIcon, TwitterIcon, LinkedinIcon, WhatsappIcon, TelegramIcon
} from 'react-share';
import { 
  Share2, X as CloseIcon, Check, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface ShareProgressProps {
  topic: string;
  score?: number | null;
  completedAt?: string | null;
  variant?: 'icon' | 'button';
  className?: string;
}

export default function ShareProgress({ 
  topic, 
  score = null, 
  completedAt = null,
  variant = 'button',
  className = ''
}: ShareProgressProps) {
  const [open, setOpen] = useState(false);
  const isCompleted = completedAt !== null;
  
  // Generate the sharing URL - this should point to your app
  const shareUrl = window.location.origin;
  
  // Create appropriate share messages based on the session status
  const title = isCompleted 
    ? `I scored ${score}% on ${topic} in my learning journey!` 
    : `I'm currently learning about ${topic}. Join me!`;
    
  const hashtags = ['learning', 'education', 'knowledge'].concat(
    topic.split(' ').map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
  );
  
  // Create a custom message for each platform
  const twitterTitle = isCompleted
    ? `I just completed learning about ${topic} and scored ${score}%! 🎓 #learning #education`
    : `I'm diving into ${topic} to expand my knowledge! 📚 #learning #education`;
    
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${title} Check it out: ${shareUrl}`).then(() => {
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
    });
  };

  const iconSize = variant === 'icon' ? 32 : 48;
  const iconRadius = 8;

  return (
    <>
      {variant === 'icon' ? (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setOpen(true)}
          className={className} 
          title="Share your progress"
        >
          <Share2 size={18} />
        </Button>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className={`flex items-center gap-2 ${className}`}
            >
              <Share2 size={16} />
              <span>Share Progress</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share your learning progress</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border">
                <h3 className="font-medium mb-1">Topic: {topic}</h3>
                {isCompleted ? (
                  <p className="text-sm flex items-center gap-1 text-green-600">
                    <Check size={16} /> Completed with score: {score}%
                  </p>
                ) : (
                  <p className="text-sm flex items-center gap-1 text-blue-600">
                    <ArrowRight size={16} /> In progress
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-5 gap-4 py-2">
                <div className="flex flex-col items-center gap-1">
                  <FacebookShareButton
                    url={shareUrl}
                    hashtag={hashtags[0]}
                    className="transition-transform hover:scale-110"
                  >
                    <FacebookIcon size={iconSize} round={Boolean(iconRadius)} borderRadius={iconRadius} />
                    <span className="text-xs mt-1">Facebook</span>
                  </FacebookShareButton>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <TwitterShareButton
                    url={shareUrl}
                    title={twitterTitle}
                    hashtags={hashtags}
                    className="transition-transform hover:scale-110"
                  >
                    <TwitterIcon size={iconSize} round={Boolean(iconRadius)} borderRadius={iconRadius} />
                    <span className="text-xs mt-1">Twitter</span>
                  </TwitterShareButton>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <LinkedinShareButton
                    url={shareUrl}
                    title={`Learning Progress: ${topic}`}
                    className="transition-transform hover:scale-110"
                  >
                    <LinkedinIcon size={iconSize} round={Boolean(iconRadius)} borderRadius={iconRadius} />
                    <span className="text-xs mt-1">LinkedIn</span>
                  </LinkedinShareButton>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <WhatsappShareButton
                    url={shareUrl}
                    title={title}
                    separator=" - "
                    className="transition-transform hover:scale-110"
                  >
                    <WhatsappIcon size={iconSize} round={Boolean(iconRadius)} borderRadius={iconRadius} />
                    <span className="text-xs mt-1">WhatsApp</span>
                  </WhatsappShareButton>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <TelegramShareButton
                    url={shareUrl}
                    title={title}
                    className="transition-transform hover:scale-110"
                  >
                    <TelegramIcon size={iconSize} round={Boolean(iconRadius)} borderRadius={iconRadius} />
                    <span className="text-xs mt-1">Telegram</span>
                  </TelegramShareButton>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <Button variant="outline" onClick={copyToClipboard}>
                  Copy Link
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost" size="sm">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}