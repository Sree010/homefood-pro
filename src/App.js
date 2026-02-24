import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Trash2, X, Plus, CheckCircle2, Bell,
  Smartphone, History, DollarSign, ArrowLeft, Upload, MapPin, Search, CreditCard
} from 'lucide-react';

export default function App() {
  // --- LOCAL STORAGE HELPERS ---
  const getSavedData = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // --- STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(getSavedData('isLoggedIn', false));
  const [role, setRole] = useState(getSavedData('role', 'user')); 
  const [cart, setCart] = useState({});
  const [activeTab, setActiveTab] = useState('All'); 
  const [activeRegion, setActiveRegion] = useState('All'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null); 
  const [onlinePlatform, setOnlinePlatform] = useState(null); 
  const [showQR, setShowQR] = useState(false); 
  const [orderHistory, setOrderHistory] = useState(getSavedData('orderHistory', []));
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  
  // --- NEW STATES FOR SIGNUP ---
  const [isSignup, setIsSignup] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState(getSavedData('registeredUsers', []));

  // Admin notification state
  const [adminNotify, setAdminNotify] = useState(false);

  const [menu, setMenu] = useState(getSavedData('menuItems', [
    { id: 1, name: "Masala Dosa", price: 60, cost: 30, category: "Breakfast", region: "Karnataka", description: "Crispy dosa with potato masala.", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400" },
    { id: 2, name: "Hyderabadi Biryani", price: 250, cost: 120, category: "Lunch", region: "Telangana", description: "Authentic spicy dum biryani.", image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=400" },
  ]));

  const categories = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  const regions = ["Telangana", "Andhra", "Karnataka", "Tamil Nadu"];

  // --- NOTIFICATION ENGINE ---
  useEffect(() => {
    const handleStorageUpdate = (e) => {
      if (e.key === 'orderHistory' && role === 'admin') {
        setAdminNotify(true);
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.play().catch(err => console.log("Audio play failed:", err));
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, [role]);

  // --- PERSISTENCE ---
  useEffect(() => {
    try {
      localStorage.setItem('menuItems', JSON.stringify(menu));
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
      localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
      localStorage.setItem('role', JSON.stringify(role));
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    } catch (error) {
      console.error("Storage limit reached", error);
    }
  }, [menu, orderHistory, isLoggedIn, role, registeredUsers]);

  // --- IMAGE HANDLING ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setTempImage(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    }
  };

  // --- HANDLERS ---
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!tempImage) return alert("Please upload a food photo!");
    const newItem = {
      id: Date.now(),
      name: e.target.itemName.value,
      cost: Number(e.target.cost.value),
      price: Number(e.target.price.value),
      category: e.target.category.value,
      region: e.target.region.value,
      description: e.target.description.value,
      image: tempImage
    };
    setMenu([newItem, ...menu]);
    setTempImage(null);
    e.target.reset();
  };

  const finalizeOrder = () => {
    const newOrder = { 
      id: "ORD-" + Math.floor(Math.random()*100000), 
      items: Object.keys(cart).filter(id => cart[id] > 0).map(id => menu.find(m => m.id === parseInt(id))?.name).join(", "),
      total: getTotal(), 
      method: selectedMethod === 'Online' ? onlinePlatform : 'Cash',
      date: new Date().toLocaleString() 
    };
    
    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
    
    const updatedHistory = [newOrder, ...orderHistory];
    setOrderHistory(updatedHistory);
    localStorage.setItem('orderHistory', JSON.stringify(updatedHistory));

    setOrderPlaced(true);
    setCart({}); setShowCart(false); setShowQR(false); setSelectedMethod(null); setOnlinePlatform(null);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const getTotal = () => Object.keys(cart).reduce((acc, id) => {
    const item = menu.find(m => m.id === parseInt(id));
    return acc + (item ? item.price * (cart[id] || 0) : 0);
  }, 0);

  const filteredMenu = menu.filter(item => {
    const matchesCategory = activeTab === 'All' || item.category === activeTab;
    const matchesRegion = activeRegion === 'All' || item.region === activeRegion;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesRegion && matchesSearch;
  });

  if (!isLoggedIn) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: "#0f172a", fontFamily: 'sans-serif' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '30px', textAlign: 'center', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <h2 style={{ fontWeight: 900 }}>HOMEFOOD <span style={{ color: '#f43f5e' }}>PRO</span></h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>{isSignup ? "Create an Account" : "Please Login"}</p>
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            const u = e.target.u.value;
            const p = e.target.p.value;
            
            if (isSignup) {
              const existing = registeredUsers.find(user => user.username === u);
              if (existing) return alert("Username already taken!");
              const newUser = { username: u, password: p, role: 'user' };
              setRegisteredUsers([...registeredUsers, newUser]);
              alert("Signup successful! Please Login.");
              setIsSignup(false);
            } else {
              if ((u === "admin" && p === "1234")) {
                setRole("admin"); setIsLoggedIn(true);
              } else {
                const userMatch = registeredUsers.find(user => user.username === u && user.password === p);
                if (userMatch) {
                  setRole(userMatch.role); setIsLoggedIn(true);
                } else {
                  alert("Wrong Credentials!");
                }
              }
            }
          }} 
          style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: 10 }}
        >
          <input name="u" placeholder="Username" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} />
          <input name="p" type="password" placeholder="Password" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} />
          <button style={{ padding: 14, background: '#f43f5e', color: 'white', borderRadius: 12, border: 'none', fontWeight: 800, cursor: 'pointer' }}>
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        <p 
          onClick={() => setIsSignup(!isSignup)} 
          style={{ marginTop: 20, fontSize: 13, color: '#f43f5e', fontWeight: 800, cursor: 'pointer' }}
        >
          {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: 100 }}>
      {/* Navbar */}
      <nav style={{ background: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <h2 style={{ fontWeight: 900, margin: 0 }}>HOMEFOOD <span style={{ color: '#f43f5e' }}>{role.toUpperCase()}</span></h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowHistory(true)} style={{ padding: 10, borderRadius: 12, border: 'none', background: '#f1f5f9', cursor: 'pointer' }}><History size={20} /></button>
          <button onClick={() => { setIsLoggedIn(false); localStorage.setItem('isLoggedIn', false); window.location.reload(); }} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#fff1f2', color: '#f43f5e', fontWeight: 800, cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 20px' }}>
        
        {/* Admin Live Notification Alert */}
        {role === 'admin' && adminNotify && (
          <div onClick={() => { setAdminNotify(false); setShowHistory(true); }} style={{ background: '#f43f5e', color: 'white', padding: '15px 25px', borderRadius: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', animation: 'pulse 2s infinite' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell size={20} />
              <span style={{ fontWeight: 800 }}>NEW ORDER RECEIVED! Click to view.</span>
            </div>
            <X size={18} />
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 25 }}>
          <Search style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
          <input 
            type="text" 
            placeholder="Search food by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '15px 15px 15px 50px', borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '16px', outline: 'none' }}
          />
        </div>

        {/* Admin Form */}
        {role === 'admin' && (
          <div style={{ background: 'white', padding: '25px', borderRadius: '25px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, fontWeight: 900 }}>➕ Add Item</h3>
            <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input name="itemName" placeholder="Item Name" required style={{ padding: 12, borderRadius: 10, border: '1px solid #eee' }} />
              <input name="price" type="number" placeholder="Price (₹)" required style={{ padding: 12, borderRadius: 10, border: '1px solid #eee' }} />
              <input name="cost" type="number" placeholder="Cost (₹)" required style={{ padding: 12, borderRadius: 10, border: '1px solid #eee' }} />
              <select name="category" style={{ padding: 12, borderRadius: 10, border: '1px solid #eee' }}>{categories.map(c => <option key={c}>{c}</option>)}</select>
              <select name="region" style={{ padding: 12, borderRadius: 10, border: '1px solid #eee' }}>{regions.map(r => <option key={r}>{r}</option>)}</select>
              <input name="description" placeholder="Description" required style={{ padding: 12, borderRadius: 10, border: '1px solid #eee' }} />
              <div style={{ border: '1px dashed #ccc', padding: 10, borderRadius: 10 }}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '12px' }} />
              </div>
              <button style={{ gridColumn: '1/-1', padding: 15, background: '#0f172a', color: 'white', borderRadius: 12, fontWeight: 800, border: 'none', cursor: 'pointer' }}>Add to Menu</button>
            </form>
          </div>
        )}

        {/* Category & Region Filters */}
        <div style={{ marginBottom: 25 }}>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 15, paddingBottom: 5 }}>
            <button onClick={() => setActiveTab('All')} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: activeTab === 'All' ? '#0f172a' : 'white', color: activeTab === 'All' ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer' }}>All</button>
            {categories.map(c => (
              <button key={c} onClick={() => setActiveTab(c)} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: activeTab === c ? '#0f172a' : 'white', color: activeTab === c ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer' }}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 5 }}>
            <button onClick={() => setActiveRegion('All')} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: activeRegion === 'All' ? '#f43f5e' : 'white', color: activeRegion === 'All' ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer' }}>All Regions</button>
            {regions.map(r => (
              <button key={r} onClick={() => setActiveRegion(r)} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: activeRegion === r ? '#f43f5e' : 'white', color: activeRegion === r ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {filteredMenu.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.02)', position: 'relative' }}>
              <img src={item.image} style={{ width: '100%', height: '200px', objectFit: 'cover' }} alt={item.name} />
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} color="#f43f5e" /> {item.region}
              </div>
              {role === 'admin' && <Trash2 onClick={() => setMenu(menu.filter(m => m.id !== item.id))} size={18} color="#f43f5e" style={{ position: 'absolute', top: 12, right: 12, background: 'white', padding: 6, borderRadius: 10, cursor: 'pointer' }} />}
              <div style={{ padding: '20px' }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: '#f43f5e', background: '#fff1f2', padding: '4px 8px', borderRadius: 6 }}>{item.category}</span>
                <h3 style={{ margin: '10px 0 5px 0', fontWeight: 800 }}>{item.name}</h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 15px 0' }}>{item.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 900, fontSize: 24 }}>₹{item.price}</span>
                  {role === 'user' && (
                    <div style={{ display: 'flex', gap: 15, background: '#f1f5f9', padding: '8px 15px', borderRadius: 12 }}>
                      <button onClick={() => setCart({ ...cart, [item.id]: Math.max(0, (cart[item.id] || 0) - 1) })} style={{ border: 'none', background: 'none', fontWeight: 900, cursor: 'pointer' }}>-</button>
                      <span style={{ fontWeight: 900 }}>{cart[item.id] || 0}</span>
                      <button onClick={() => setCart({ ...cart, [item.id]: (cart[item.id] || 0) + 1 })} style={{ border: 'none', background: 'none', fontWeight: 900, cursor: 'pointer' }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Checkout */}
      {role === 'user' && getTotal() > 0 && (
        <button onClick={() => setShowCart(true)} style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#0f172a', color: 'white', padding: '18px 45px', borderRadius: 50, fontWeight: 900, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', gap: 10, alignItems: 'center', zIndex: 1000, cursor: 'pointer' }}>
          <ShoppingCart size={22} /> View Cart • ₹{getTotal()}
        </button>
      )}

      {/* Payment Modal */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', width: '400px', padding: 30, borderRadius: 35, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <X onClick={() => { setShowCart(false); setShowQR(false); setSelectedMethod(null); setOnlinePlatform(null); }} style={{ position: 'absolute', top: 25, right: 25, cursor: 'pointer' }} />
            {!selectedMethod ? (
              <>
                <h2 style={{ fontWeight: 900, textAlign: 'center', marginBottom: 20 }}>Select Payment</h2>
                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 20, marginBottom: 20, textAlign: 'center' }}>
                  <span style={{ color: '#64748b' }}>Total Amount</span>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>₹{getTotal()}</div>
                </div>
                <div style={{ display: 'grid', gap: 15 }}>
                  <div onClick={() => setSelectedMethod('Online')} style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 20, border: '1px solid #eee', borderRadius: 20, cursor: 'pointer', transition: '0.2s' }}>
                    <div style={{ background: '#e0e7ff', p: 10, borderRadius: 12, padding: 8 }}><Smartphone color="#4f46e5" /></div>
                    <div><b style={{ display: 'block' }}>Online Payment</b><small style={{ color: '#64748b' }}>PhonePe, GPay, Paytm</small></div>
                  </div>
                  <div onClick={() => setSelectedMethod('COD')} style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 20, border: '1px solid #eee', borderRadius: 20, cursor: 'pointer' }}>
                    <div style={{ background: '#dcfce7', p: 10, borderRadius: 12, padding: 8 }}><DollarSign color="#16a34a" /></div>
                    <div><b style={{ display: 'block' }}>Cash on Delivery</b><small style={{ color: '#64748b' }}>Pay when you receive</small></div>
                  </div>
                </div>
              </>
            ) : selectedMethod === 'Online' && !showQR ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <ArrowLeft onClick={() => setSelectedMethod(null)} style={{ cursor: 'pointer' }} />
                  <h2 style={{ fontWeight: 900, margin: 0 }}>Pay Online</h2>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {['PhonePe', 'Google Pay', 'Paytm', 'Amazon Pay'].map(app => (
                    <div key={app} onClick={() => setOnlinePlatform(app)} style={{ display: 'flex', justifyContent: 'space-between', padding: 18, border: onlinePlatform === app ? '2px solid #4f46e5' : '1px solid #eee', borderRadius: 15, cursor: 'pointer', fontWeight: 700 }}>
                      {app} {onlinePlatform === app && <CheckCircle2 size={18} color="#4f46e5" />}
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowQR(true)} disabled={!onlinePlatform} style={{ width: '100%', padding: 18, background: '#4f46e5', color: 'white', borderRadius: 18, fontWeight: 800, marginTop: 25, border: 'none', cursor: 'pointer' }}>Pay with {onlinePlatform || 'App'}</button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <ArrowLeft onClick={() => setShowQR(false)} style={{ cursor: 'pointer' }} />
                  <h2 style={{ fontWeight: 900, margin: 0 }}>Scan to Pay</h2>
                </div>
                <div style={{ background: '#f1f5f9', padding: 20, borderRadius: 25, margin: '10px 0 20px 0' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=7396678009@ybl&pn=HomeFood&am=${getTotal()}&cu=INR`)}`} style={{ width: 200, height: 200, borderRadius: 10 }} alt="UPI QR" />
                  <p style={{ marginTop: 15, fontWeight: 800, color: '#4f46e5' }}>{onlinePlatform} QR Code</p>
                </div>
                <button onClick={finalizeOrder} style={{ width: '100%', padding: 18, background: '#10b981', color: 'white', borderRadius: 18, fontWeight: 800, border: 'none', cursor: 'pointer' }}>Verify Payment ✅</button>
              </div>
            )}
            {selectedMethod === 'COD' && (
                <button onClick={finalizeOrder} style={{ width: '100%', padding: 18, background: '#10b981', color: 'white', borderRadius: 18, fontWeight: 800, marginTop: 20, border: 'none', cursor: 'pointer' }}>Place COD Order</button>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '420px', padding: 35, borderRadius: 35, maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <X onClick={() => setShowHistory(false)} style={{ position: 'absolute', top: 25, right: 25, cursor: 'pointer' }} />
            <h2 style={{ fontWeight: 900, marginBottom: 20 }}>Order Records 📜</h2>
            {orderHistory.length === 0 ? <p style={{ color: '#94a3b8' }}>No orders yet!</p> : orderHistory.map(o => (
              <div key={o.id} style={{ background: '#f8fafc', padding: 18, borderRadius: 20, marginBottom: 15, borderLeft: '6px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{o.date}</span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#10b981' }}>{o.method}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{o.items}</div>
                <div style={{ color: '#0f172a', fontWeight: 900, fontSize: 18, marginTop: 5 }}>₹{o.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Animation */}
      {orderPlaced && (
        <div style={{ position: 'fixed', inset: 0, background: '#10b981', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <CheckCircle2 size={120} strokeWidth={3} />
          <h1 style={{ fontWeight: 900, marginTop: 25, fontSize: 40 }}>ORDER PLACED!</h1>
          <p>Tasty food is on the way...</p>
        </div>
      )}
    </div>
  );
}