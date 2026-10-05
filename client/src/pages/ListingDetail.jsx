import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import BookingBox from '../components/BookingBox.jsx';
import Reviews from '../components/Reviews.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get(`/listings/${id}`)
      .then(({ data }) => setListing(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!listing) return <Loader />;

  return (
    <section>
      <h1>{listing.title}</h1>
      <p className="muted">
        {listing.reviewCount > 0 ? `★ ${listing.avgRating} · ${listing.reviewCount} reviews · ` : ''}
        {listing.city}, {listing.state}
      </p>

      {/* TODO: image gallery / carousel when a listing has multiple images */}
      <img className="hero-img" src={listing.images[0]} alt={listing.title} />

      <div className="detail-layout">
        <div>
          <h2>
            {listing.type} hosted by {listing.host?.name}
          </h2>

          <p className="muted">
            Up to {listing.maxGuests} guests · {listing.bedrooms} bedroom
            {listing.bedrooms !== 1 ? 's' : ''}
          </p>

          <p>{listing.description}</p>

          <h3>Amenities</h3>
          <ul className="amenities">
            {listing.amenities.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>

          <h3>Location</h3>
          <p className="muted">
            {listing.address}, {listing.city}
          </p>

          {listing.location?.lat && listing.location?.lng && (
            <MapContainer
              center={[listing.location.lat, listing.location.lng]}
              zoom={13}
              scrollWheelZoom={false}
              className="listing-map"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[listing.location.lat, listing.location.lng]}>
                <Popup>{listing.title}</Popup>
              </Marker>
            </MapContainer>
          )}

          <Reviews listingId={listing._id} onReviewAdded={load} />
        </div>

        <BookingBox listing={listing} />
      </div>
    </section>
  );
}