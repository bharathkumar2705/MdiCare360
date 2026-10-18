import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorService } from '../../services';
import { LoadingSpinner, EmptyState, StatusBadge, Pagination } from '../../components/common/UI';
import { format } from 'date-fns';

const SPECIALIZATIONS = ['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Medicine', 'Gynecology', 'Psychiatry', 'Endocrinology', 'Ophthalmology', 'Pulmonology', 'Gastroenterology'];

function DoctorCard({ doctor, onBook }) {
  const navigate = useNavigate();
  const { userId, specialization, experience, rating, reviewCount, consultationFeeOnline, consultationFeeInPerson, isOnlineConsultationAvailable, verificationStatus, qualifications } = doctor;

  return (
    <div className="doctor-card fade-in">
      <div className="doctor-card-header">
        <div className="doctor-avatar">
          {userId?.avatar ? <img src={userId.avatar} alt={userId?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (userId?.name?.split(' ').slice(0, 2).map((n) => n[0]).join('') || 'DR')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="doctor-name truncate">{userId?.name}</div>
            {verificationStatus === 'VERIFIED' && (
              <span title="Verified Doctor" style={{ color: 'var(--color-success)', fontSize: 16 }}>✓</span>
            )}
          </div>
          <div className="doctor-spec">{specialization}</div>
          <div className="rating-stars" style={{ marginTop: 6 }}>
            {[1,2,3,4,5].map((s) => <span key={s} style={{ color: s <= Math.round(rating) ? 'var(--color-warning)' : 'var(--color-border)' }}>★</span>)}
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginLeft: 4 }}>{Number(rating).toFixed(1)} ({reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      <div className="doctor-card-body">
        <div className="doctor-meta">
          <div className="doctor-meta-item">🎓 {experience} yrs exp</div>
          {qualifications?.[0]?.degree && <div className="doctor-meta-item">📋 {qualifications[0].degree}</div>}
          {isOnlineConsultationAvailable && <div className="doctor-meta-item" style={{ color: 'var(--color-success)' }}>🟢 Online Available</div>}
        </div>
      </div>

      <div className="doctor-card-footer">
        <div>
          {isOnlineConsultationAvailable && (
            <div className="fee-badge">₹{consultationFeeOnline} <span>/ online</span></div>
          )}
          <div className="fee-badge">₹{consultationFeeInPerson} <span>/ in-person</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/patient/doctors/${doctor._id}`)}>Profile</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/patient/appointments/book/${doctor._id}`)}>Book</button>
        </div>
      </div>
    </div>
  );
}

export default function FindDoctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    specialization: searchParams.get('specialization') || '',
    consultationType: '',
    minRating: '',
    minExperience: '',
    sort: 'rating',
    search: searchParams.get('q') || '',
    page: 1,
  });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.specialization) params.specialization = filters.specialization;
      if (filters.consultationType) params.consultationType = filters.consultationType;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.minExperience) params.minExperience = filters.minExperience;
      if (filters.sort) params.sort = filters.sort;
      params.page = filters.page;
      params.limit = 9;

      const res = await doctorService.search(params);
      setDoctors(res.data.data);
      setPagination(res.data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Find Doctors</h1>
        <p className="page-subtitle">Discover and book appointments with trusted healthcare professionals</p>
      </div>

      {/* Search bar */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--color-border)', padding: '20px 24px', marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label className="form-label">Specialization</label>
          <select className="form-select" value={filters.specialization} onChange={(e) => setFilter('specialization', e.target.value)}>
            <option value="">All Specializations</option>
            {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label className="form-label">Consultation Type</label>
          <select className="form-select" value={filters.consultationType} onChange={(e) => setFilter('consultationType', e.target.value)}>
            <option value="">Any</option>
            <option value="ONLINE">Online</option>
            <option value="IN_PERSON">In-Person</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label className="form-label">Min Rating</label>
          <select className="form-select" value={filters.minRating} onChange={(e) => setFilter('minRating', e.target.value)}>
            <option value="">Any</option>
            <option value="4">4+ ★</option>
            <option value="4.5">4.5+ ★</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label className="form-label">Min Experience</label>
          <select className="form-select" value={filters.minExperience} onChange={(e) => setFilter('minExperience', e.target.value)}>
            <option value="">Any</option>
            <option value="5">5+ years</option>
            <option value="10">10+ years</option>
            <option value="15">15+ years</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label className="form-label">Sort By</label>
          <select className="form-select" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
            <option value="rating">Top Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="fee_asc">Lowest Fee</option>
            <option value="fee_desc">Highest Fee</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={fetchDoctors}>Search</button>
        <button className="btn btn-outline" onClick={() => setFilters({ specialization: '', consultationType: '', minRating: '', minExperience: '', sort: 'rating', search: '', page: 1 })}>Reset</button>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
          {loading ? 'Searching...' : `${pagination.total} doctors found`}
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Finding doctors..." />
      ) : doctors.length === 0 ? (
        <EmptyState icon="🔍" title="No doctors found" description="Try adjusting your filters to find more doctors." action={<button className="btn btn-outline-primary" onClick={() => setFilters((f) => ({ ...f, specialization: '', consultationType: '', minRating: '', minExperience: '' }))}>Clear Filters</button>} />
      ) : (
        <>
          <div className="grid-3">
            {doctors.map((d) => <DoctorCard key={d._id} doctor={d} />)}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
        </>
      )}
    </div>
  );
}
