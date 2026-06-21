import { Link } from "react-router-dom";

export default function Sidebar({ menu }) {
  return (
    <aside
      style={{
        width: "250px",
        background: "#f5f5f5",
        padding: "20px",
      }}
    >
      {menu.map((item) => (
        <div key={item.path}>
          <Link to={item.path}>
            {item.nombre}
          </Link>
        </div>
      ))}
    </aside>
  );
}
