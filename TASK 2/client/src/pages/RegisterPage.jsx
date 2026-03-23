import { useState } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/api.js';
import { useNavigation } from '../context/NavigationContext.jsx';
import {
  UK_CITY_AREAS,
  formatUkPhoneInput,
  normalizeUkPhone,
  formatUkPostcodeInput,
  normalizeUkPostcode,
  getUkPostcodeHint,
} from '../data/ukLocations.js';

const RegisterPage = () => {
  const { navigate } = useNavigation();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    farm_name: '',
    contact_number: '',
    city: 'Gloucester, Gloucestershire',
    postcode: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const postcodeHint = getUkPostcodeHint(form.city);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const setPhone = (e) => {
    const formatted = formatUkPhoneInput(e.target.value);
    setForm((f) => ({ ...f, contact_number: formatted }));
  };
  const setPostcode = (e) => {
    const formatted = formatUkPostcodeInput(e.target.value);
    setForm((f) => ({ ...f, postcode: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const normalizedPostcode = normalizeUkPostcode(form.postcode);
    if (!normalizedPostcode) {
      setError(`Enter a valid UK postcode, for example ${postcodeHint}`);
      return;
    }

    if (!form.city) {
      setError('Please select a city/area');
      return;
    }

    if (form.role === 'producer' && (!form.farm_name || !form.contact_number)) {
      setError('Farm name and contact number are required for producer accounts');
      return;
    }

    const normalizedPhone = normalizeUkPhone(form.contact_number);
    if (form.role === 'producer' && !normalizedPhone) {
      setError('Enter a valid UK phone number, for example +44 7123 456 789');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        role: form.role,
        farm_name: form.role === 'producer' ? form.farm_name.trim() : undefined,
        contact_number: form.role === 'producer' ? normalizedPhone : undefined,
      });
      navigate('verify-email', { token: data.verifyToken, email: form.email.trim() });
    } catch (err) {
      setError(err.message || 'Network error — check server is running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar role="customer" />

      <div style={{maxWidth:'640px', margin:'32px auto', padding:'0 20px 40px'}}>
        <div style={{fontFamily:"'Playfair Display',serif", fontSize:'22px', fontWeight:700, color:'var(--green-deep)', marginBottom:'20px', textAlign:'center'}}>Create Your Account</div>

        {error && (
          <div style={{background:'#fde8e6', color:'var(--red)', border:'1px solid #f5c6c2', borderRadius:'4px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px'}}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{background:'#e8f5e9', color:'var(--green-deep)', border:'1px solid var(--border)', borderRadius:'6px', padding:'20px', textAlign:'center'}}>
            <div style={{fontSize:'14px', fontWeight:700, marginBottom:'8px'}}>Account Created!</div>
            <p style={{fontSize:'13px', color:'#555', marginBottom:'16px'}}>{success}</p>
            <button className="btn btn-deep" onClick={() => navigate('login')}>Go to Login ›</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{background:'#fff', border:'1px solid var(--border)', borderRadius:'6px', padding:'24px'}}>

            <div className="form-section">
              <div className="form-section-title">Your Details</div>
              <div className="form-row">
                <span className="form-label">Account Type:<span className="req">*</span></span>
                <select className="form-input" style={{height:'32px'}} value={form.role} onChange={set('role')}>
                  <option value="customer">Customer</option>
                  <option value="producer">Producer / Farm</option>
                </select>
              </div>
              {form.role === 'producer' && (
                <>
                  <div className="form-row">
                    <span className="form-label">Farm Name:<span className="req">*</span></span>
                    <input type="text" className="form-input" value={form.farm_name} onChange={set('farm_name')} required />
                  </div>
                  <div className="form-row">
                    <span className="form-label">Contact Number:<span className="req">*</span></span>
                    <input
                      type="tel"
                      className="form-input"
                      value={form.contact_number}
                      onChange={setPhone}
                      required
                      placeholder="+44 7123 456 789"
                    />
                  </div>
                </>
              )}
              <div className="form-row">
                <span className="form-label">E-Mail:<span className="req">*</span></span>
                <input type="email" className="form-input" value={form.email} onChange={set('email')} required />
              </div>
              <div className="form-row">
                <span className="form-label">Password:<span className="req">*</span></span>
                <input type="password" className="form-input" value={form.password} onChange={set('password')} required placeholder="Min 8 chars, upper, lower, number, symbol" />
              </div>
              <div className="form-row">
                <span className="form-label">Confirm Password:<span className="req">*</span></span>
                <input type="password" className="form-input" value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Your Address</div>
              <div className="form-row">
                <span className="form-label">Street Address:<span className="req">*</span></span>
                <input type="text" className="form-input" />
              </div>
              <div className="form-row">
                <span className="form-label">Street Address 2:</span>
                <input type="text" className="form-input" />
              </div>
              <div className="form-row">
                <span className="form-label">Post Code:<span className="req">*</span></span>
                <input
                  type="text"
                  className="form-input"
                  value={form.postcode}
                  onChange={setPostcode}
                  placeholder={postcodeHint}
                  required
                />
                <div style={{ fontSize: '11px', color: '#7a7a7a', marginTop: '4px' }}>
                  Example for selected city/area: {postcodeHint}
                </div>
              </div>
              <div className="form-row">
                <span className="form-label">City:<span className="req">*</span></span>
                <>
                  <input
                    list="uk-city-areas"
                    className="form-input"
                    value={form.city}
                    onChange={set('city')}
                    placeholder="Type to search city or area"
                    required
                  />
                  <datalist id="uk-city-areas">
                    {UK_CITY_AREAS.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </>
              </div>
              {form.role !== 'producer' && (
                <div className="form-row">
                  <span className="form-label">Telephone:</span>
                  <input
                    type="tel"
                    className="form-input"
                    value={form.contact_number}
                    onChange={setPhone}
                    placeholder="+44 7123 456 789"
                  />
                </div>
              )}
              <div className="form-row">
                <span className="form-label">Country:</span>
                <span style={{fontSize:'12px', color:'#555'}}>United Kingdom</span>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Newsletter</div>
              <p style={{fontSize:'12px', color:'#666', marginBottom:'12px', lineHeight:1.6}}>
                Would you like to receive our weekly produce update? (We never share your data)
              </p>
              <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                <label style={{fontSize:'12px', display:'flex', alignItems:'center', gap:'8px'}}>
                  <input type="radio" name="newsletter" style={{accentColor:'var(--green-deep)'}} /> Yes please, I'm in
                </label>
                <label style={{fontSize:'12px', display:'flex', alignItems:'center', gap:'8px'}}>
                  <input type="radio" name="newsletter" defaultChecked style={{accentColor:'var(--green-deep)'}} /> No thank you
                </label>
              </div>
            </div>

            <div style={{textAlign:'right', marginTop:'8px'}}>
              <button type="submit" className="btn btn-deep" style={{padding:'10px 28px', fontSize:'14px'}} disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account ›'}
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
