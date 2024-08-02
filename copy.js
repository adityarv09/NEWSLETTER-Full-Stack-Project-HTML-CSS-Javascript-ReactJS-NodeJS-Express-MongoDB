import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";



function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    }

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    async function getFacts() {
      setIsLoading(true);

      let query = supabase.from("facts").select("*");

      if (currentCategory !== "all") {
        query = query.eq("category", currentCategory);
      }

      const { data: facts, error } = await query
        .order("votesInteresting", { descending: true })
        .limit(1000);

      if (!error) setFacts(facts);
      else alert("There was a problem getting data");

      setIsLoading(false);
    }

    getFacts();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [currentCategory]);

  const handleVote = async (columnName, fact) => {
    if (!user) {
      alert("You must be logged in to vote!");
      return;
    }

    // Check if the user has already voted for this fact
    const hasVoted = user?.metadata?.votedFacts?.includes(fact.id);
    if (hasVoted) {
      alert("You have already voted for this fact!");
      return;
    }

    // Update the fact votes
    setIsLoading(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();
    setIsLoading(false);

    if (!error) {
      // Update user metadata to mark this fact as voted
      const { user: updatedUser, error: userError } = await supabase.auth.update({
        id: user.id,
        metadata: {
          ...user.metadata,
          votedFacts: [...(user.metadata?.votedFacts ?? []), fact.id],
        },
      });

      if (!userError) {
        setUser(updatedUser);
      }

      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
    }
  };

  return (
    <>
      <Header
        showForm={showForm}
        setShowForm={setShowForm}
        user={user}
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

function Header({ showForm, setShowForm, user, setShowSignUp }) {
  const appTitle = "NEWSLETTER";

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error.message);
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

// Assuming these components are part of your existing App component

function LoginPage({ setShowSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert("Error logging in: " + error.message);
    setLoading(false);
  }

  return (
    <div className="login-page">
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
  );
}

function SignUpPage({ setShowSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) alert("Error signing up: " + error.message);
    setLoading(false);
  }

  return (
    <div className="signup-page">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
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
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);

      if (newFact && newFact.length > 0) {
        setFacts((facts) => [newFact[0], ...facts]);
        setText("");
        setSource("");
        setCategory("");
        setShowForm(false);
      } else {
        console.error("Error inserting new fact:", error);
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

function FactList({ facts, setFacts, user }) {
  if (facts.length === 0)
    return (
      <p className="message">No Facts for this category yet! Create the first one ✌.</p>
    );

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} user={user} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database. Add your own!</p>
    </section>
  );
}


function Fact({ fact, setFacts, user }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesFalse > fact.votesInteresting + fact.votesMindblowing;

  async function handleVote(columnName) {
    if (!user) {
      alert("You must be logged in to vote!");
      return;
    }

    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setFacts((facts) => facts.map((f) => (f.id === fact.id ? updatedFact[0] : f)));
  }

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
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>
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

       

         
