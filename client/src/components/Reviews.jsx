import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from './StarRating.jsx';
import { formatDate } from '../utils/format.js';

export default function Reviews({ listingId, onReviewAdded }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');

  const load = () =>
    api
      .get(`/listings/${listingId}/reviews`)
      .then(({ data }) => setReviews(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, [listingId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post(`/listings/${listingId}/reviews`, form);
      setForm({ rating: 5, comment: '' });
      load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditingForm({
      rating: review.rating,
      comment: review.comment,
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingForm({ rating: 5, comment: '' });
  };

  const updateReview = async (reviewId) => {
    setError('');

    try {
      await api.put(`/listings/${listingId}/reviews/${reviewId}`, editingForm);
      cancelEdit();
      load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;

    setError('');

    try {
      await api.delete(`/listings/${listingId}/reviews/${reviewId}`);
      load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const userReview = reviews.find((review) => review.user?._id === user?._id);

  return (
    <section className="reviews">
      <h2>Reviews ({reviews.length})</h2>

      {error && <p className="error">{error}</p>}

      {reviews.length === 0 && <p className="muted">No reviews yet.</p>}

      {reviews.map((r) => (
        <div key={r._id} className="review">
          {editingId === r._id ? (
            <>
              <StarRating
                value={editingForm.rating}
                onChange={(rating) =>
                  setEditingForm({ ...editingForm, rating })
                }
              />

              <textarea
                required
                value={editingForm.comment}
                onChange={(e) =>
                  setEditingForm({
                    ...editingForm,
                    comment: e.target.value,
                  })
                }
              />

              <div className="row">
                <button
                  type="button"
                  className="btn"
                  onClick={() => updateReview(r._id)}
                >
                  Save
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="row-between">
                <strong>{r.user?.name}</strong>
                <span className="muted small">
                  {formatDate(r.createdAt)}
                </span>
              </div>

              <div className="stars-static">
                {'★'.repeat(r.rating)}
                {'☆'.repeat(5 - r.rating)}
              </div>

              <p>{r.comment}</p>

              {user && r.user?._id === user._id && (
                <div className="row">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => startEdit(r)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => deleteReview(r._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {user && !userReview && (
        <form className="card form" onSubmit={submit}>
          <h3>Write a review</h3>

          <StarRating
            value={form.rating}
            onChange={(rating) => setForm({ ...form, rating })}
          />

          <textarea
            required
            placeholder="How was your stay?"
            value={form.comment}
            onChange={(e) =>
              setForm({ ...form, comment: e.target.value })
            }
          />

          <button className="btn">Submit review</button>
        </form>
      )}
    </section>
  );
}