/** Grey cards in the shape of real ones, shown while articles load. */
export default function ArticleSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card card--skeleton">
          <div className="card__media" />
          <div className="card__body">
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--medium" />
          </div>
        </div>
      ))}
    </div>
  );
}
