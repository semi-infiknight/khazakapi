import ApiCard from "../ApiCard.jsx";

export default function FeatureApiCard({ api, feature }) {
  const showApiContext =
    api.plugIn?.why &&
    (api.plugIn.why !== feature.why || api.plugIn.where !== feature.where);

  return (
    <div className="intent-feature-api">
      <ApiCard api={api} />
      {showApiContext && (
        <p className="intent-feature-api-note">
          <span className="intent-feature-api-note-label">Why</span> {api.plugIn.why}
          {api.plugIn.where ? (
            <>
              {" "}
              <span className="intent-feature-api-note-label">Where</span> {api.plugIn.where}
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
