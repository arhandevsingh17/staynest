import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/client.js';
import { STAY_TYPES } from '../../utils/format.js';

const empty = {
  title: '',
  description: '',
  type: 'homestay',
  city: '',
  state: '',
  address: '',
  pricePerNight: '',
  maxGuests: 2,
  bedrooms: 1,
  amenities: '',
  imageUrl: '',
};

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;

    api.get(`/listings/${id}`).then(({ data }) =>
      setForm({
        ...empty,
        ...data,
        amenities: data.amenities.join(', '),
        imageUrl: data.images[0] || '',
      })
    );
  }, [id, isEdit]);

  const validate = (values) => {
    const newErrors = {};

    const title = values.title.trim();
    const description = values.description.trim();
    const price = values.pricePerNight;
    const imageUrl = values.imageUrl.trim();

    if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters.';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be at most 100 characters.';
    }

    if (description.length < 30) {
      newErrors.description =
        'Description must be at least 30 characters.';
    }

    if (price === '' || Number(price) <= 0) {
      newErrors.pricePerNight = 'Price must be greater than 0.';
    }

    if (imageUrl) {
      try {
        new URL(imageUrl);
      } catch {
        newErrors.imageUrl = 'Please enter a valid image URL.';
      }
    }

    return newErrors;
  };

  const set = (key) => (e) => {
    const updatedForm = {
      ...form,
      [key]: e.target.value,
    };

    setForm(updatedForm);
    setErrors(validate(updatedForm));
  };

  const submit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setError('');

    const {
      title,
      description,
      type,
      city,
      state,
      address,
      imageUrl,
      amenities,
    } = form;

    const payload = {
      title,
      description,
      type,
      city,
      state,
      address,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      amenities: amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    };

    if (imageUrl) payload.images = [imageUrl];

    try {
      if (isEdit) {
        await api.put(`/listings/${id}`, payload);
      } else {
        await api.post('/listings', payload);
      }

      navigate('/host');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form className="card form wide" onSubmit={submit}>
      <h1>{isEdit ? 'Edit listing' : 'Create a new listing'}</h1>

      <input
        required
        placeholder="Title"
        value={form.title}
        onChange={set('title')}
      />
      {errors.title && <p className="error">{errors.title}</p>}

      <textarea
        required
        placeholder="Describe your place"
        value={form.description}
        onChange={set('description')}
      />
      {errors.description && (
        <p className="error">{errors.description}</p>
      )}

      <div className="row">
        <select value={form.type} onChange={set('type')}>
          {STAY_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <div className="grow">
          <input
            required
            type="number"
            min="0"
            placeholder="Price per night (₹)"
            value={form.pricePerNight}
            onChange={set('pricePerNight')}
          />
          {errors.pricePerNight && (
            <p className="error">{errors.pricePerNight}</p>
          )}
        </div>
      </div>

      <div className="row">
        <input
          required
          placeholder="City"
          value={form.city}
          onChange={set('city')}
        />
        <input
          required
          placeholder="State"
          value={form.state}
          onChange={set('state')}
        />
      </div>

      <input
        required
        placeholder="Address"
        value={form.address}
        onChange={set('address')}
      />

      <div className="row">
        <label className="grow">
          Max guests
          <input
            type="number"
            min="1"
            value={form.maxGuests}
            onChange={set('maxGuests')}
          />
        </label>

        <label className="grow">
          Bedrooms
          <input
            type="number"
            min="0"
            value={form.bedrooms}
            onChange={set('bedrooms')}
          />
        </label>
      </div>

      <input
        placeholder="Amenities (comma separated: WiFi, AC, Parking)"
        value={form.amenities}
        onChange={set('amenities')}
      />

      <input
        placeholder="Image URL (optional)"
        value={form.imageUrl}
        onChange={set('imageUrl')}
      />
      {errors.imageUrl && (
        <p className="error">{errors.imageUrl}</p>
      )}

      {error && <p className="error">{error}</p>}

      <button
        className="btn"
        type="submit"
        disabled={hasErrors}
      >
        {isEdit ? 'Save changes' : 'Publish listing'}
      </button>
    </form>
  );
}
