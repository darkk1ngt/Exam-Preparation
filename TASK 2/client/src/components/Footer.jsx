import { useNavigation } from '../context/NavigationContext.jsx';

const Footer = () => {
  const { navigate } = useNavigation();

  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>Monday–Friday (8:30am to 6pm)</p>
          <p>Saturday–Sunday (9am to 2pm)</p>
          <p>Email: hello@glh.co.uk</p>
          <p>Tel: 01234 567 890</p>
          <p style={{marginTop:'10px'}}>Unit 4, Thornbury Lane, Gloucestershire GL12 8HN</p>
        </div>
        <div className="footer-col">
          <h4>Follow Us</h4>
          <p style={{fontSize:'11px',color:'#666',marginBottom:'8px'}}>Our mobile-friendly site</p>
          <div className="footer-social">
            <span style={{fontWeight:700,fontSize:'11px'}}>f</span>
            <span style={{fontWeight:700,fontSize:'11px'}}>ig</span>
            <span style={{fontWeight:700,fontSize:'11px'}}>tw</span>
          </div>
          <h4 style={{marginTop:'20px'}}>Links</h4>
          <a style={{cursor:'pointer'}} onClick={() => navigate('loyalty')}>See our reviews</a>
        </div>
        <div className="footer-col">
          <h4>Information</h4>
          <a style={{cursor:'pointer'}} onClick={() => navigate('tracking')}>Next Collection Slots</a>
          <a style={{cursor:'pointer'}} onClick={() => navigate('tracking')}>Order Deadlines</a>
          <a style={{cursor:'pointer'}} onClick={() => navigate('home')}>How to Order</a>
          <a style={{cursor:'pointer'}} onClick={() => navigate('home')}>Delivery Information</a>
          <a style={{cursor:'pointer'}} onClick={() => navigate('home', { category: 'New & Seasonal' })}>What's in Season</a>
          <a href="#" onClick={e => e.preventDefault()}>WCAG Accessibility Statement</a>
        </div>
        <div className="footer-col">
          <h4>Links</h4>
          <a style={{cursor:'pointer'}} onClick={() => navigate('home')}>About GLH</a>
          <a style={{cursor:'pointer'}} onClick={() => navigate('home')}>Meet the Farmers</a>
          <a style={{cursor:'pointer'}} onClick={() => navigate('loyalty')}>Loyalty Programme</a>
          <a style={{cursor:'pointer'}} onClick={() => navigate('login')}>Producer Login</a>
          <a style={{cursor:'pointer'}} onClick={() => navigate('home')}>Sitemap</a>
          <h4 style={{marginTop:'20px'}}>Producers</h4>
          <a style={{cursor:'pointer'}} onClick={() => navigate('register')}>Join as a Producer</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Greenfield Local Hub. All rights reserved.</span>
        <span>
          <a href="#" onClick={e => e.preventDefault()} style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',marginRight:'14px'}}>Terms &amp; Conditions</a>
          <a href="#" onClick={e => e.preventDefault()} style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',marginRight:'14px'}}>Privacy Policy</a>
          <a href="#" onClick={e => e.preventDefault()} style={{color:'rgba(255,255,255,0.4)',textDecoration:'none'}}>Cookie Policy</a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
