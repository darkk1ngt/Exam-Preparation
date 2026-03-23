import Sidebar from './Sidebar.jsx';

const ICONS = {
  orders: (
    <svg className="trailing-icon" style={{ width: '17px', height: '17px', fill: 'none', strokeWidth: 1.8 }} viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    </svg>
  ),
  loyalty: (
    <svg className="trailing-icon" style={{ width: '17px', height: '17px', fill: 'none', strokeWidth: 1.8 }} viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  account: (
    <svg className="trailing-icon" style={{ width: '17px', height: '17px', fill: 'none', strokeWidth: 1.8 }} viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  ),
  notifications: (
    <svg className="trailing-icon" style={{ width: '17px', height: '17px', fill: 'none', strokeWidth: 1.8 }} viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

const ITEMS = [
  { key: 'orders', label: 'My Orders', page: 'tracking' },
  { key: 'loyalty', label: 'Loyalty Points', page: 'loyalty' },
  { key: 'account', label: 'Account Details' },
  { key: 'notifications', label: 'Notifications', page: 'notifications' },
];

export default function AccountSidebar({ activeKey, navigate }) {
  return (
    <Sidebar heading="My Account">
      {ITEMS.map((item) => {
        const isActive = item.key === activeKey;
        const clickable = Boolean(item.page) && !isActive;

        return (
          <a
            key={item.key}
            className={`sidebar-item with-trailing-icon ${isActive ? 'active' : ''}`}
            style={{ cursor: clickable ? 'pointer' : 'default' }}
            onClick={clickable ? () => navigate(item.page) : undefined}
          >
            <span>{item.label}</span>
            {ICONS[item.key]}
          </a>
        );
      })}
    </Sidebar>
  );
}
