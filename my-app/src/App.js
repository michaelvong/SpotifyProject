import React, { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

function App() {
  const authEndpoint = 'https://accounts.spotify.com/authorize';
  const clientId = "e9e84e9d5c72484a96a42e5bc7d42512";
  const redirectUri = "http://localhost:3000/";
  const scopes = [
    'user-read-private'
  ];

  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);

  //useEffect is called when page opens, this component strips the token from the hash
  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
        token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

        window.location.hash = ""
        window.localStorage.setItem("token", token)
    }
    setToken(token)

}, [])

  //this component grabs the user using spotify web api
  useEffect(() => {
    if (token) {
      let spotifyApi = new SpotifyWebApi();
      spotifyApi.setAccessToken(token);
      spotifyApi.getMe().then((r) => {
        setUser(r);
      });
    }
  }, [token])

  //login component, redirects to spotify auth page
  const handleLogin = () => {
    window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
  }


  //basic logout component, removes token and refreshes page
  const handleLogout = () => {
    setToken("")
    window.localStorage.removeItem("token")
    window.location.reload(false)
  }
  
  return (
    <div className="App">
     <h1>Spotify Project</h1>
     <button type="login" onClick={handleLogin}>Login</button>
     
     { user !== null && 
      <div>
        <h2>test{user.display_name}</h2>
        <h2>{user.id}</h2>
        <h3>Followers: {user.followers.total}</h3>
        <button onClick={handleLogout}>Logout</button>
      </div>
     }
     
    </div>
  );
}

export default App;