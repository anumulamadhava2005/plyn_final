
import { Link } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { text: "About Us", href: "/about" },
    { text: "Terms of Service", href: "/terms" },
    { text: "Privacy Policy", href: "/privacy" },
    { text: "Contact", href: "/contact" },
    { text: "Security", href: "/security" },
  ];

  return (
    <div className="w-64 min-h-screen border-r">
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.href}
                className="block py-3 px-4 text-sm hover:text-teal-500 hover:border-teal-500 transition-colors"
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
