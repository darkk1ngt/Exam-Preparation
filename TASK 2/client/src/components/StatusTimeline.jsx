/**
 * Order status timeline (FR1).
 *
 * Props:
 *   items – array of { label: string, time: string, done?: bool, active?: bool }
 *           done   → green filled dot, normal label colour
 *           active → amber dot, amber label
 *           (neither) → grey dot, grey label (#bbb) — pending step
 */
const StatusTimeline = ({ items }) => (
  <div className="timeline" style={{marginTop:'14px'}}>
    {items.map((item, i) => (
      <div key={i} className="tl-item">
        <div className={`tl-dot${item.done ? ' done' : item.active ? ' active' : ''}`}></div>
        <div className="tl-label" style={
          item.active ? {color:'var(--amber)'} :
          !item.done && !item.active ? {color:'#bbb'} : {}
        }>{item.label}</div>
        <div className="tl-time">{item.time}</div>
      </div>
    ))}
  </div>
);

export default StatusTimeline;
