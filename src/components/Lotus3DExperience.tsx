import ThemeHero3DDiorama from './ThemeHero3DDiorama';

interface Lotus3DExperienceProps {
  height?: number;
  className?: string;
}

export default function Lotus3DExperience({
  height = 240,
  className = '',
}: Lotus3DExperienceProps) {
  return (
    <ThemeHero3DDiorama
      theme="lotus-zen-sanctuary"
      height={height}
      className={className}
    />
  );
}
