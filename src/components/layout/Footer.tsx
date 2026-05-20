import { Link } from 'react-router-dom'

const Footer = () => (
  <footer style={{ background: '#0A0A0A', color: '#A8A8A8', marginTop: 'auto' }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        <div>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '20px', fontWeight: 700, color: '#00A86B', letterSpacing: '-0.03em' }}>Bron</span>
            <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '20px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em' }}>Uz</span>
          </div>
          <p style={{ fontSize: '13px', lineHeight: '1.6', maxWidth: '260px' }}>
            O'zbekistondagi istalgan joyni bron qiling — kafe, restoran, sport maydoni va boshqalar.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <a href="tel:+998900000000" style={{ color: '#A8A8A8', fontSize: '13px', textDecoration: 'none' }}>+998 90 000 00 00</a>
          </div>
        </div>

        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6B6B', marginBottom: '16px' }}>Sayt</p>
          {[['/', 'Bosh sahifa'], ['/search', 'Qidirish'], ['/register', "Ro'yxatdan o'tish"]].map(([to, label]) => (
            <Link key={to} to={to} style={{ display: 'block', color: '#A8A8A8', textDecoration: 'none', fontSize: '13px', marginBottom: '10px', transition: 'color 150ms' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#00A86B'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#A8A8A8'}
            >{label}</Link>
          ))}
        </div>

        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6B6B', marginBottom: '16px' }}>Kategoriyalar</p>
          {[['cafe', 'Kafe'], ['restaurant', 'Restoran'], ['football', 'Futbol'], ['gaming', 'Gaming'], ['gym', 'Sport zal']].map(([slug, label]) => (
            <Link key={slug} to={`/search?category=${slug}`} style={{ display: 'block', color: '#A8A8A8', textDecoration: 'none', fontSize: '13px', marginBottom: '10px', transition: 'color 150ms' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#00A86B'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#A8A8A8'}
            >{label}</Link>
          ))}
        </div>

        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6B6B', marginBottom: '16px' }}>Biznes uchun</p>
          {[['/register', "Joyingizni qo'shing"], ['/business/dashboard', 'Biznes panel']].map(([to, label]) => (
            <Link key={to} to={to} style={{ display: 'block', color: '#A8A8A8', textDecoration: 'none', fontSize: '13px', marginBottom: '10px', transition: 'color 150ms' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#00A86B'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#A8A8A8'}
            >{label}</Link>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontSize: '12px', color: '#6B6B6B' }}>© 2026 BronUz. Barcha huquqlar himoyalangan.</p>
        <p style={{ fontSize: '12px', color: '#6B6B6B' }}>Toshkent, O'zbekiston 🇺🇿</p>
      </div>
    </div>
  </footer>
)
export default Footer
