/**
 * Single notification row (FR4).
 *
 * Props:
 *   icon     – ReactNode: the icon element (including its container div)
 *   title    – string
 *   body     – string
 *   time     – string
 *   tag      – string label for the tag pill
 *   tagClass – CSS class for the tag (e.g. 'tag-green', 'tag-amber', 'tag-blue')
 *   unread   – boolean; applies 'unread' class + green left border
 *   style    – optional inline style (e.g. { opacity: 0.7 })
 */
const NotifItem = ({ icon, title, body, time, tag, tagClass = 'tag-green', unread = false, style }) => (
  <div className={`notif-item${unread ? ' unread' : ''}`} style={style}>
    {icon}
    <div style={{flex: 1}}>
      <div className="notif-title">{title}</div>
      <div className="notif-body">{body}</div>
      <div className="notif-time">{time}</div>
    </div>
    <span className={`tag ${tagClass}`} style={{flexShrink: 0, fontSize: '10px'}}>{tag}</span>
  </div>
);

export default NotifItem;
