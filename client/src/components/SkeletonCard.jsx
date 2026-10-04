export default function SkeletonCard() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="card-body">
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-location" />
        <div className="skeleton skeleton-price" />
      </div>
    </div>
  );
}
