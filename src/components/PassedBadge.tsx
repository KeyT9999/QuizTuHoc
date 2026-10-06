export interface PassedBadgeProps {
  isPassed?: boolean;
}

export default function PassedBadge({ isPassed }: PassedBadgeProps) {
  if (!isPassed) return null;

  return (
    <div
      className="passed-stamp"
      title="Đã hoàn thành môn học này!"
      aria-label="Trạng thái: Đã hoàn thành (PASSED)"
    >
      <span className="passed-stamp-check" aria-hidden="true">✓</span>
      <span className="passed-stamp-text">PASSED</span>
    </div>
  );
}
