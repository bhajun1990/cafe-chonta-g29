import { useEffect, useMemo, useState } from "react";

const API = "http://127.0.0.1:8000/api";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");

  const totalItems = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart]
  );

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
      if (--n[id] <= 0) delete n[id];
      return n;
    });

  const checkout = async () => {
    try {
      if (!token) throw new Error("Pega el token access");
      const items = Object.entries(cart).map(([product_id, quantity]) => ({
        product: Number(product_id),
        quantity,
      }));

      const res = await fetch(`${API}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error("HTTP " + res.status);
      setCart({});
      setMsg("✅ Compra realizada correctamente");
    } catch (e) {
      setMsg("❌ " + e.message);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>☕ Café Chonta</h1>

      <div style={{ marginBottom: 15 }}>
        <b>Token (access) para comprar:</b>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Pega aquí el access token"
          style={{ width: "100%", padding: 8, marginTop: 6 }}
        />
      </div>

      {msg && <p>{msg}</p>}

      {products.map((p) => (
        <div key={p.id} style={{ border: "1px solid #444", padding: 10, marginBottom: 10 }}>
          <b>{p.name}</b>
          <div>{p.description}</div>
          <div>Precio: S/ {p.price}</div>
          <div>Stock: {p.stock}</div>
          <button onClick={() => add(p.id)}>Agregar</button>
        </div>
      ))}

      <h3>Carrito ({totalItems})</h3>
      {Object.keys(cart).length > 0 && (
        <button onClick={checkout}>Checkout</button>
      )}
    </div>
  );
}


