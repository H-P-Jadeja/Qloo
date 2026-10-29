import Link from 'next/link';

export default function AppleFooter() {
  return (
    <footer className="apple-footer">
      <div className="apple-footer-inner">
        <div className="apple-footer-cols">
          <div className="apple-footer-col">
            <h5>TasteTransplant</h5>
            <ul>
              <li><Link href="/onboarding">Build Taste Profile</Link></li>
              <li><Link href="/destination">Destination Concierge</Link></li>
              <li><Link href="/plan/4tpk4dgk">Live Demo (Berlin)</Link></li>
              <li><Link href="/compare/4tpk4dgk">LLM Grounding Benchmark</Link></li>
            </ul>
          </div>

          <div className="apple-footer-col">
            <h5>Hero Cities</h5>
            <ul>
              <li><Link href="/destination">Berlin, Germany</Link></li>
              <li><Link href="/destination">Toronto, Canada</Link></li>
              <li><Link href="/destination">Tokyo, Japan</Link></li>
              <li><Link href="/destination">London, UK</Link></li>
              <li><Link href="/destination">New York, USA</Link></li>
            </ul>
          </div>

          <div className="apple-footer-col">
            <h5>Qloo API Grounding</h5>
            <ul>
              <li><a href="https://docs.qloo.com" target="_blank" rel="noreferrer">Qloo API Documentation ↗</a></li>
              <li><a href="https://qloo.com" target="_blank" rel="noreferrer">Qloo Taste Graph Platform ↗</a></li>
              <li><span style={{ color: '#86868b' }}>Endpoint: /v2/insights</span></li>
              <li><span style={{ color: '#86868b' }}>Taste DNA via /v2/insights</span></li>
            </ul>
          </div>

          <div className="apple-footer-col">
            <h5>Hackathon Project</h5>
            <ul>
              <li><a href="https://github.com/H-P-Jadeja/Qloo" target="_blank" rel="noreferrer">GitHub Repository ↗</a></li>
              <li><a href="https://github.com/H-P-Jadeja/Qloo/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT License ↗</a></li>
              <li><Link href="/">Overview</Link></li>
              <li><Link href="/onboarding">Get Started</Link></li>
            </ul>
          </div>
        </div>

        <div className="apple-footer-bottom">
          <p>© {new Date().getFullYear()} TasteTransplant. Built for the Qloo AI Hackathon. All recommendations are grounded in Qloo’s cultural entity graph.</p>
          <div className="row" style={{ gap: 16 }}>
            <a href="https://github.com/H-P-Jadeja/Qloo" target="_blank" rel="noreferrer">GitHub</a>
            <span>•</span>
            <a href="https://docs.qloo.com" target="_blank" rel="noreferrer">Qloo Docs</a>
            <span>•</span>
            <Link href="/compare/4tpk4dgk">LLM Benchmark</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
