import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000/api";

export default function App() {
  // ===== Auth (localStorage) =====
  const [token, setToken] = useState(() => localStorage.getItem("access") || "");
  const [authMsg, setAuthMsg] = useState("");

  // login/register form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "register"

  // ===== Shop =====
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({}); // { [productId]: qty }
  const [msg, setMsg] = useState("");

  // invitado
  const [guestEmail, setGuestEmail] = useState("");

  // Mis pedidos
  const [myOrders, setMyOrders] = useState([]);
  const [showMyOrders, setShowMyOrders] = useState(false);

  const totalItems = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart]
  );

  // Cargar productos
  useEffect(() => {
    fetch(`${API}/products/`)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(setProducts)
      .catch((e) => setMsg("Error: " + e.message));
  }, []);

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));

  const sub = (id) =>
    setCart((c) => {
      const n = { ...c };
      if ((n[id] || 0) <= 1) delete n[id];
      else n[id] = n[id] - 1;
      return n;
    });

  // ===== Login =====
  const login = async (e) => {
    e.preventDefault();
    setAuthMsg("");

    try {
      const res = await fetch(`${API}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthMsg(data?.detail || "Login falló");
        return;
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      setToken(data.access);
      setAuthMsg("✅ Login OK");
      setPassword("");
    } catch (err) {
      setAuthMsg("Error: " + err.message);
    }
  };

  // ===== Register =====
  const register = async (e) => {
    e.preventDefault();
    setAuthMsg("");
    if (!username.trim() || !password.trim()) {
  setAuthMsg("❌ Completa usuario y contraseña para registrarte");
  return;
}

    try {
      const res = await fetch(`${API}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAuthMsg("❌ No se pudo crear la cuenta. Intenta nuevamente.");
        return;
      }

      setAuthMsg(data.message || "✅ Usuario creado. Ahora inicia sesión.");
      setMode("login");
      setPassword("");
    } catch (err) {
      setAuthMsg("Error: " + err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setToken("");
    setMyOrders([]);
    setShowMyOrders(false);
    setAuthMsg("Sesión cerrada");
  };

  // ===== Mis pedidos (protegido) =====
  const loadMyOrders = async () => {
    setMsg("");
    try {
      const res = await fetch(`${API}/my-orders/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setMsg("❌ No autorizado (token inválido o no logeado)");
        return;
      }
      if (!res.ok) throw new Error("HTTP " + res.status);

      const data = await res.json();
      setMyOrders(data);
      setShowMyOrders(true);
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  // ===== Checkout (invitado o logeado) =====
  const checkout = async () => {
    setMsg("");

    const items = Object.entries(cart).map(([productId, quantity]) => ({
      product_id: Number(productId),
      quantity,
    }));

    if (items.length === 0) {
      setMsg("Carrito vacío");
      return;
    }

    if (!token && !guestEmail) {
      setMsg("⚠️ Para comprar como invitado, ingresa tu correo.");
      return;
    }

    const payload = token ? { items } : { items, guest_email: guestEmail };

    try {
      const res = await fetch(`${API}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg("❌ Error al crear pedido: " + JSON.stringify(data));
        return;
      }

      setMsg(`✅ Pedido creado. ID: ${data.id}`);
      setCart({});
      if (token) loadMyOrders();
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <div>
      <h1>Café Chonta</h1>

      {/* ==== AUTH ==== */}
      <div style={{ textAlign: "left", marginBottom: 16 }}>
        <h2>Login (para ver historial)</h2>

        {!token ? (
          <>
            {mode === "login" ? (
              <form
                onSubmit={login}
                style={{ display: "grid", gap: 8, maxWidth: 360 }}
              >
                <input
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  placeholder="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Iniciar sesión</button>
                <button type="button" onClick={() => setMode("register")}>
                  Crear cuenta
                </button>
                {authMsg && <p>{authMsg}</p>}
              </form>
            ) : (
              <form
                onSubmit={register}
                style={{ display: "grid", gap: 8, maxWidth: 360 }}
              >
                <input
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  placeholder="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Registrarme</button>
                <button type="button" onClick={() => setMode("login")}>
                  Volver al login
                </button>
                {authMsg && <p>{authMsg}</p>}
              </form>
            )}
          </>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <p>✅ Logeado</p>
            <button onClick={loadMyOrders}>Ver mis pedidos</button>
            <button onClick={logout}>Cerrar sesión</button>
          </div>
        )}
      </div>

      {/* ==== PRODUCTOS ==== */}
      <div style={{ textAlign: "left" }}>
        <h2>Productos</h2>
        {msg && <p>{msg}</p>}

        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #333", padding: 10, marginBottom: 10 }}>
            <b>{p.name}</b>
            <div>Precio: {p.price}</div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
              <button onClick={() => sub(p.id)}>-</button>
              <span>Cantidad: {cart[p.id] || 0}</span>
              <button onClick={() => add(p.id)}>+</button>
            </div>
          </div>
        ))}

        <h3>Carrito: {totalItems} items</h3>

        {!token && (
          <div style={{ maxWidth: 360, display: "grid", gap: 8 }}>
            <p>
              Compra como invitado ✅ (sin login) — pero necesitas correo para confirmación.
            </p>
            <input
              placeholder="Correo para confirmación (invitado)"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
            />
          </div>
        )}

        <button onClick={checkout} style={{ marginTop: 10 }}>
          Comprar
        </button>
      </div>

      {/* ==== MIS PEDIDOS ==== */}
      {token && showMyOrders && (
        <div style={{ textAlign: "left", marginTop: 24 }}>
          <h2>Mis pedidos</h2>
          {myOrders.length === 0 ? (
            <p>Aún no tienes pedidos.</p>
          ) : (
            <ul>
              {myOrders.map((o) => (
                <li key={o.id}>
                  Pedido #{o.id} — {new Date(o.created_at).toLocaleString()} — Items:{" "}
                  {o.items?.length || 0}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}