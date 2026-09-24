import { ArrowUpRight, Boxes } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tools } from '../tools/registry';

export function Dashboard() {
  return (
    <div className="dashboard">
      <section className="dashboard-intro">
        <span className="eyebrow"><Boxes size={15} aria-hidden="true" /> Utility collection</span>
        <h1>Small tools.<br /><em>Clear outcomes.</em></h1>
        <p>A focused workspace for the repetitive tasks that interrupt a developer's flow.</p>
      </section>

      <section className="dashboard-tools" aria-labelledby="available-tools">
        <div className="section-heading">
          <div>
            <span className="section-index">01</span>
            <h2 id="available-tools">Available tools</h2>
          </div>
          <span>{tools.length.toString().padStart(2, '0')} total</span>
        </div>
        <div className="tool-grid">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link className="tool-tile" to={tool.path} key={tool.id}>
                <span className="tool-tile-icon"><Icon size={24} strokeWidth={1.6} aria-hidden="true" /></span>
                <span className="tool-tile-copy">
                  <strong>{tool.title}</strong>
                  <small>{tool.description}</small>
                </span>
                <ArrowUpRight className="tool-tile-arrow" size={19} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
