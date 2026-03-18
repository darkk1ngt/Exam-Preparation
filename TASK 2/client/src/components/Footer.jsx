const Footer = () => (
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
        <a href="#">See our reviews</a>
      </div>
      <div className="footer-col">
        <h4>Information</h4>
        <a href="#">Next Collection Slots</a>
        <a href="#">Order Deadlines</a>
        <a href="#">How to Order</a>
        <a href="#">Delivery Information</a>
        <a href="#">What's in Season</a>
        <a href="#">WCAG Accessibility Statement</a>
      </div>
      <div className="footer-col">
        <h4>Links</h4>
        <a href="#">About GLH</a>
        <a href="#">Meet the Farmers</a>
        <a href="#">Loyalty Programme</a>
        <a href="#">Producer Login</a>
        <a href="#">Sitemap</a>
        <h4 style={{marginTop:'20px'}}>Producers</h4>
        <a href="#">Join as a Producer</a>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© 2026 Greenfield Local Hub. All rights reserved.</span>
      <span>
        <a href="#" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',marginRight:'14px'}}>Terms &amp; Conditions</a>
        <a href="#" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none',marginRight:'14px'}}>Privacy Policy</a>
        <a href="#" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none'}}>Cookie Policy</a>
      </span>
    </div>
  </footer>
);

export default Footer;
