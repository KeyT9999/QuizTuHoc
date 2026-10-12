export default function ZenTempleSeal({
  size = 46,
  text = 'TU TÂM KHAI TRÍ',
  className = '',
}: {
  size?: number;
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`zen-temple-seal ${className}`}
      title="Ấn Triện Phật Quốc — Khai Minh Trí Tuệ"
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        borderRadius: 6,
        border: '2.5px solid #991B1B',
        background: 'rgba(185, 28, 28, 0.08)',
        boxShadow: 'inset 0 0 6px rgba(185, 28, 28, 0.25), 0 2px 6px rgba(0,0,0,0.1)',
        transform: 'rotate(-4deg)',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Inner antique border ring */}
      <div
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid rgba(185, 28, 28, 0.65)',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <span
          style={{
            color: '#991B1B',
            fontFamily: "'Cinzel', serif",
            fontWeight: 900,
            fontSize: size * 0.17,
            lineHeight: 1.15,
            letterSpacing: 0.5,
            textAlign: 'center',
            textTransform: 'uppercase',
            opacity: 0.9,
            textShadow: '0 0 1px rgba(153, 27, 27, 0.5)',
          }}
        >
          {text.split(' ').length > 2 ? (
            <>
              <span>{text.split(' ').slice(0, 2).join(' ')}</span>
              <br />
              <span>{text.split(' ').slice(2).join(' ')}</span>
            </>
          ) : (
            text
          )}
        </span>
      </div>
    </div>
  );
}
