interface QuestionImagesProps {
  images?: string[];
}

export default function QuestionImages({ images }: QuestionImagesProps) {
  if (!images || images.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        margin: '14px 0 18px',
        alignItems: 'center',
      }}
    >
      {images.map((src, idx) => (
        <img
          key={`${src}-${idx}`}
          src={src}
          alt={`Hình minh họa câu hỏi ${idx + 1}`}
          loading="lazy"
          style={{
            maxWidth: '100%',
            maxHeight: '360px',
            objectFit: 'contain',
            borderRadius: '10px',
            background: '#ffffff',
            padding: '8px',
            border: '1px solid rgba(148, 163, 184, 0.35)',
          }}
        />
      ))}
    </div>
  );
}
