import { useEffect, useState } from "react";
import "./style.css";

const API_BASE_URL = "http://localhost:3002"; // Adjust this based on your backend URL

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.user) {
          console.log(data);
          setUser(data.user);
        }
      }
    }

    fetchSession();
    getFacts();
  }, [currentCategory]);

  async function getFacts() {
    setIsLoading(true);

    let url = `${API_BASE_URL}/articles`;
    if (currentCategory !== "all") {
      url += `?category=${currentCategory}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      setFacts(data);
    } else {
      alert("There was a problem getting data");
    }

    setIsLoading(false);
  }

  const handleVote = async (columnName, fact) => {
    if (!user) {
      alert("You must be logged in to vote!");
      return;
    }

    const token = localStorage.getItem("token");

    // Update the fact votes
    //setIsLoading(true);
    const response = await fetch(`${API_BASE_URL}/articles/${fact._id}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ voteType: columnName }),
    });

    const updatedFact = await response.json();
    //setIsLoading(false);

    if (response.ok) {
      setFacts((facts) => facts.map((f) => (f._id === fact._id ? updatedFact : f)));
    }
  };

  return (
    <>
      <Header
        showForm={showForm}
        setShowForm={setShowForm}
        user={user}
        setUser={setUser} // Pass setUser as a prop
        setShowSignUp={setShowSignUp}
      />
      {user ? (
        showForm ? (
          <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
        ) : null
      ) : showSignUp ? (
        <SignUpPage setShowSignUp={setShowSignUp} />
      ) : (
        <LoginPage setShowSignUp={setShowSignUp} />
      )}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? <Loader /> : <FactList facts={facts} setFacts={setFacts} user={user} handleVote={handleVote} />}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm, user, setUser, setShowSignUp }) { // Accept setUser as a prop
  const appTitle = "NEWSLETTER";

  async function handleLogout() {
    localStorage.removeItem("token");
    setUser(null); // Use setUser here
  }

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Newsletter" />
        <h1>{appTitle}</h1>
      </div>
      {user ? (
        <div>
          <button
            className="btn btn-large btn-open"
            onClick={() => setShowForm((show) => !show)}
          >
            {showForm ? "Close" : "Share a Fact"}
          </button>
          <button className="btn btn-large btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : null}
    </header>
  );
}

function LoginPage({ setShowSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: email, password }),
    });
    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      localStorage.setItem("token", data.token);
      setShowSignUp(false);
      window.location.reload();
    } else {
      alert("Error logging in: " + data.error);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-large" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p>
          Don't have an account?{" "}
          <button onClick={() => setShowSignUp(true)} className="btn btn-link">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

function SignUpPage({ setShowSignUp }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }), // Ensure the fields match what the backend expects
    });
    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      alert("Sign up successful! Please log in.");
      setShowSignUp(false);
    } else {
      alert("Error signing up: " + data.error);
    }
  }

  return (
    <div className="overlay">
      <div className="modal">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-large" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p>
          Already have an account?{" "}
          <button onClick={() => setShowSignUp(false)} className="btn btn-link">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}



function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      setIsUploading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, source, category }),
      });

      const newFact = await response.json();
      setIsUploading(false);

      if (response.ok) {
        setFacts((facts) => [newFact, ...facts]);
        setText("");
        setSource("");
        setCategory("");
        setShowForm(false);
      } else {
        console.error("Error inserting new fact:", newFact.error);
      }
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose Category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab30B" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button className="btn btn-all-categories" onClick={() => setCurrentCategory("all")}>
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts, user, handleVote }) {
  if (facts.length === 0)
    return (
      <p className="message">No Facts for this category yet! Create the first one ✌.</p>
    );

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact._id} fact={fact} setFacts={setFacts} user={user} handleVote={handleVote} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database. Add your own!</p>
    </section>
  );
}

function Fact({ fact, setFacts, user, handleVote }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed = fact.votesFalse > fact.votesInteresting + fact.votesMindblowing;

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[⛔ DISPUTED]</span> : null}
        {fact.text}
        <a className="source" href={fact.source}>
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting", fact)}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing", fact)}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse", fact)} disabled={isUpdating}>
          ⛔ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}


function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export default App;
