export function Loader({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="loader-wrap">
      <div className="spinner" />

      <span>{label}</span>
    </div>
  );
}