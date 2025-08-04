'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TracingBeam } from '../../../components/ui/tracing-beam';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/secret');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex w-full flex-col items-center">
        <div className="flex flex-col w-full max-w-md px-8 items-center justify-center gap-y-4">
          <TracingBeam className="px-0">
            <div className="flex flex-col w-full align-center justify-center space-y-8 items-center">
              <div className="flex flex-col w-full align-center justify-center space-y-4 items-center">
                <p className="w-full font-aeonik-bold tracking-tight text-center leading-[100%] text-[21px] mb-3">PRODUCTIVITY HUB</p>
                <h1 className="font-voyager-thin text-[32px] md:text-[44px] leading-[125%] text-center tracking-tight mb-3">Access Restricted</h1>
                <p className="w-full font-aeonik-thin tracking-[0.015em] text-center text-[18px] text-gray-400 mb-8">
                  This is a private productivity workspace for the team.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-aeonik-regular text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-aeonik-regular"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm font-aeonik-regular text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-aeonik-regular py-2 px-4 rounded-lg transition duration-200"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="font-aeonik-thin text-gray-500 text-sm">
                  Authorized personnel only
                </p>
              </div>
            </div>
          </TracingBeam>
        </div>
      </div>
    </div>
  );
};

export default Login;
