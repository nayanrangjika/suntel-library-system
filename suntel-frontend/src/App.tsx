import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Book as BookIcon, User, LogOut, Plus, Trash2, ShieldAlert, Library, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

// --- API CONFIGURATION ---
const API_URL = 'http://localhost:5000';

// --- TYPES ---
interface UserType {
  username: string;
  role: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  status: string;
  publishedYear: number;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  login: (token: string, role: string, username: string) => void;
  logout: () => void;
}

// --- CONTEXT (State Management) ---
const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedRole && savedUsername) {
      setToken(savedToken);
      setUser({ role: savedRole, username: savedUsername });
    }
  }, []);

  const login = (newToken: string, role: string, username: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
    setToken(newToken);
    setUser({ role, username });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext) as AuthContextType;

// --- COMPONENTS ---

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:bg-indigo-700 transition-colors">
              <Library className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Suntel<span className="text-indigo-600">Library</span></span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Catalog</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                Admin Panel
              </Link>
            )}
            <div className="flex items-center bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
              <User className="h-4 w-4 text-slate-500 mr-2" />
              <span className="text-sm font-semibold text-slate-700 mr-3">
                {user.username} <span className="text-xs font-normal text-slate-500 uppercase tracking-wider ml-1">({user.role})</span>
              </span>
              <button 
                onClick={() => { logout(); navigate('/login'); }} 
                className="text-slate-400 hover:text-red-500 transition-colors border-l border-slate-300 pl-3 flex items-center"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        const role = username.toLowerCase() === 'admin' ? 'admin' : 'user';
        await axios.post(`${API_URL}/auth/register`, { username, password, role });
        setError('Registration successful! Please log in.');
        setIsRegistering(false);
      } else {
        const response = await axios.post(`${API_URL}/auth/login`, { username, password });
        login(response.data.token, response.data.role, username);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Make sure backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
            <BookIcon className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {isRegistering ? 'Create an account' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isRegistering ? 'Join the Suntel Library system today' : 'Please enter your details to sign in.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`p-4 text-sm rounded-xl flex items-center ${error.includes('successful') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white/50" 
                placeholder="Enter your username" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white/50" 
                placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:shadow-lg active:scale-[0.98]">
              {isRegistering ? 'Register Account' : 'Sign In'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const { token } = useAuth();

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/books`, { headers: { Authorization: `Bearer ${token}` } });
      setBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch books", err);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'borrowed' : 'available';
    try {
      await axios.patch(`${API_URL}/books/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      fetchBooks();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Library Catalog</h1>
          <p className="text-slate-500 mt-1">Browse and manage our collection of books.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
          Total Books: <span className="text-indigo-600 font-bold">{books.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <div key={book.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-indigo-100 flex flex-col overflow-hidden">
            {/* Status indicator bar at the top */}
            <div className={`h-1.5 w-full ${book.status === 'available' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
            
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${book.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {book.status === 'available' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                  ${book.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {book.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">{book.title}</h3>
              <p className="text-sm font-medium text-slate-500 mb-4">{book.author} • {book.publishedYear}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleStatusChange(book.id, book.status)}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2
                    ${book.status === 'available' 
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-sm hover:shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <BookOpen className="w-4 h-4" />
                  {book.status === 'available' ? 'Borrow Book' : 'Return Book'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {books.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <BookIcon className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No books found</h3>
            <p className="text-slate-500">The library catalog is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', publishedYear: '' });
  const [error, setError] = useState('');
  const { token, user } = useAuth();

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/books`, { headers: { Authorization: `Bearer ${token}` } });
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/books`, newBook, { headers: { Authorization: `Bearer ${token}` } });
      setNewBook({ title: '', author: '', publishedYear: '' });
      fetchBooks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add book');
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`${API_URL}/books/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchBooks();
    } catch (err) {
      alert('Failed to delete book');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-50 p-6 rounded-full mb-6">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-600 max-w-md">You do not have the required administrator privileges to view or interact with this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage the library catalog and user resources.</p>
      </div>
      
      {/* Add Book Form */}
      <div className="bg-white shadow-md shadow-slate-200/50 rounded-2xl mb-10 border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <div className="bg-indigo-100 p-1.5 rounded-lg mr-3">
              <Plus className="h-5 w-5 text-indigo-600"/> 
            </div>
            Add New Book
          </h3>
        </div>
        <div className="p-6">
          {error && <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">{error}</div>}
          <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Book Title</label>
              <input type="text" required value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} 
                className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50 focus:bg-white" placeholder="e.g. The Great Gatsby" />
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Author Name</label>
              <input type="text" required value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} 
                className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50 focus:bg-white" placeholder="e.g. F. Scott Fitzgerald" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year</label>
              <input type="number" required value={newBook.publishedYear} onChange={e => setNewBook({...newBook, publishedYear: e.target.value})} 
                className="block w-full border border-slate-200 rounded-xl shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50 focus:bg-white" placeholder="e.g. 1925" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 font-bold transition-all active:scale-[0.98] flex justify-center items-center">
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Manage Books Table */}
      <div className="bg-white shadow-md shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Book Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {books.map(book => (
                <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
                        <BookIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="font-bold text-slate-900">{book.title}</div>
                        <div className="text-sm font-medium text-slate-500">{book.author} <span className="text-slate-300 mx-1">•</span> {book.publishedYear}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border 
                      ${book.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {book.status === 'available' ? 'Available' : 'Borrowed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(book.id)} className="inline-flex items-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-semibold">
                      <Trash2 className="h-4 w-4 mr-1.5"/> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    No books in the catalog yet. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- ROUTER & PROTECTED ROUTES ---

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><BookList /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}