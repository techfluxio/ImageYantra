/**
 * SOCIAL_TOOLS
 * ────────────────────────────────────────────────────────────
 * Image resize presets for popular social platforms. Each entry
 * carries the exact pixel dimensions the platform expects, so the
 * generic resize/crop flow can be pointed at the right output size.
 */
export const SOCIAL_TOOLS = [
  { slug: 'yt-thumbnail',    name: 'YouTube Thumbnail',   desc: 'Resize images to the standard YouTube thumbnail size.',       icon: 'resize', dims: '1280 × 720 px' },
  { slug: 'ig-post',         name: 'Instagram Post',      desc: 'Crop and resize photos for a perfect Instagram post.',        icon: 'crop',   dims: '1080 × 1350 px' },
  { slug: 'ig-story',        name: 'Instagram Story',     desc: 'Resize images to fit Instagram Stories and Reels.',           icon: 'crop',   dims: '1080 × 1920 px' },
  { slug: 'fb-cover',        name: 'Facebook Cover',      desc: 'Resize your Facebook profile cover photo.',                   icon: 'resize', dims: '851 × 315 px' },
  { slug: 'twitter-header',  name: 'Twitter / X Header',  desc: 'Resize a banner image for your Twitter/X profile.',          icon: 'resize', dims: '1500 × 500 px' },
  { slug: 'linkedin-banner', name: 'LinkedIn Banner',     desc: 'Resize a cover banner for your LinkedIn profile.',            icon: 'resize', dims: '1584 × 396 px' },
  { slug: 'tiktok-cover',    name: 'TikTok Cover',        desc: 'Resize a cover image for TikTok videos.',                      icon: 'crop',   dims: '1080 × 1920 px' },
  { slug: 'pinterest-pin',   name: 'Pinterest Pin',       desc: 'Resize images to the ideal Pinterest Pin ratio.',              icon: 'crop',   dims: '1000 × 1500 px' },
  { slug: 'snapchat-ad',     name: 'Snapchat Image',      desc: 'Resize images for Snapchat posts and ads.',                    icon: 'crop',   dims: '1080 × 1920 px' },
  { slug: 'whatsapp-dp',     name: 'WhatsApp DP',         desc: 'Crop a square display picture for WhatsApp.',                  icon: 'crop',   dims: '500 × 500 px' },
  { slug: 'discord-banner',  name: 'Discord Banner',      desc: 'Resize a profile banner image for Discord.',                   icon: 'resize', dims: '960 × 540 px' },
  { slug: 'reddit-banner',   name: 'Reddit Banner',       desc: 'Resize a community banner image for Reddit.',                  icon: 'resize', dims: '1920 × 384 px' },
  { slug: 'twitter-post',    name: 'Twitter / X Post',    desc: 'Resize an image for a Twitter/X post.',                        icon: 'crop',   dims: '1600 × 900 px' },
  { slug: 'yt-banner',       name: 'YouTube Banner',      desc: 'Resize a channel art banner for YouTube.',                     icon: 'resize', dims: '2560 × 1440 px' },
  { slug: 'ig-reel-cover',   name: 'Instagram Reel Cover',desc: 'Resize a cover image for Instagram Reels.',                    icon: 'crop',   dims: '1080 × 1920 px' },
];
