import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Book as BookIcon, User, LogOut, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';

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
    // Check if user is already logged in on page load
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
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <BookIcon className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight">Suntel Library</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-indigo-200 transition">Books</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="hover:text-indigo-200 transition font-semibold text-yellow-300">Admin Panel</Link>
            )}
            <div className="flex items-center bg-indigo-700 px-4 py-2 rounded-full">
              <User className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium mr-4">{user.username} ({user.role})</span>
              <button onClick={() => { logout(); navigate('/login'); }} className="text-indigo-200 hover:text-white flex items-center">
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
        // We auto-assign 'admin' role if username is 'admin' for easy testing
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600">
          <BookIcon className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isRegistering ? 'Create an account' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`p-3 text-sm rounded-md ${error.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              {isRegistering ? 'Register' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-sm text-indigo-600 hover:text-indigo-500">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Library Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 flex flex-col">
            <div className="p-6 flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{book.title}</h3>
              <p className="text-sm text-gray-500 mb-4">by {book.author} • {book.publishedYear}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                ${book.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {book.status}
              </span>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => handleStatusChange(book.id, book.status)}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
                  ${book.status === 'available' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 hover:bg-gray-500'}`}
              >
                {book.status === 'available' ? 'Borrow Book' : 'Return Book'}
              </button>
            </div>
          </div>
        ))}
        {books.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No books available in the library yet.
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
      <div className="flex flex-col items-center justify-center py-20 text-red-600">
        <ShieldAlert className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You need Administrator privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Add Book Form */}
      <div className="bg-white shadow rounded-lg mb-8 border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-indigo-500"/> Add New Book
          </h3>
        </div>
        <div className="p-6">
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" required value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Author</label>
              <input type="text" required value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input type="number" required value={newBook.publishedYear} onChange={e => setNewBook({...newBook, publishedYear: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 font-medium">Add Book</button>
          </form>
        </div>
      </div>

      {/* Manage Books Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map(book => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{book.title}</div>
                  <div className="text-sm text-gray-500">{book.author} ({book.publishedYear})</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {book.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-900 flex items-center justify-end w-full">
                    <Trash2 className="h-4 w-4 mr-1"/> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <div className="min-h-screen bg-gray-50 font-sans">
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