import React, { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import logo from './spotifylogo.png'
import './css/App.css'
function App() {
  const authEndpoint = 'https://accounts.spotify.com/authorize';
  const clientId = "e9e84e9d5c72484a96a42e5bc7d42512";
  const redirectUri = "http://localhost:3000/";
  const scopes = [
    'user-read-private'
  ];

  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [userPlaylists, setPlaylists] = useState([])
  const [userChoice, setChoice] = useState('')

  let spotifyApi = new SpotifyWebApi();

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
  
  //component to show playlist
  const showUserPlaylist = () => {
    spotifyApi.getUserPlaylists(user.id).then(response => {
      setPlaylists(response.items)
    })
  }

  const handlePlaylistSubmit = () => {
    
  }

  return (
    <div style = {{textAlign: "center", height: "100%"}}>
      <div className="login-page">
        <div className="banner">
          <h1 className="banner-text">Spotify Music Quiz</h1>
          <img alt="logo" src={logo} width="100" height="100"/> 
        </div>
          
          <div>
          {userPlaylists.map((playlist, index) => (
            <div>{playlist.name} </div>
          ))}
          </div>

          <div>
            <select value={userChoice} onChange={e=>setChoice(e.target.value)}> {
              userPlaylists.map(opt=><option>{opt.name}</option>)
            } 
            </select>
            <button onClick={() => {handlePlaylistSubmit()}}>Submit</button>
          </div>


        { user == null && 
          <button className = "login-btn" type="login" onClick={() => {handleLogin()}} >Login</button>
        }
      </div>
     

     { user !== null && 
      <div className='user-info'>
        <img alt="profile" src={user.images[0].url}/>
        <h2>{user.display_name}</h2>
        <h2>{user.id}</h2>
        <h3>Followers: {user.followers.total}</h3>
        <button onClick={() => {showUserPlaylist()}}>See playlists</button>
        <button className = "logout-btn" onClick={handleLogout}>Logout</button>
      </div>
     }
     
    </div>
  );
}

export default App;