/**
 * Shared sidebar wrapper.
 *
 * Props:
 *   heading  – string | ReactNode  (rendered in the dark heading bar; omit to skip)
 *   children – sidebar items, sections, and filters as JSX
 */
const Sidebar = ({ heading, children }) => (
  <div className="sidebar">
    {heading && <div className="sidebar-heading">{heading}</div>}
    {children}
  </div>
);

export default Sidebar;
