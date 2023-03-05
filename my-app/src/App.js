import React, { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import logo from './spotifylogo.png'
import './css/App.css'
function App() {
  const authEndpoint = 'https://accounts.spotify.com/authorize';
  const clientId = "e9e84e9d5c72484a96a42e5bc7d42512";
  const redirectUri = "http://localhost:3000/";
  const scopes = [
    'user-read-private',
    'user-modify-playback-state'
  ];

  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [userPlaylists, setPlaylists] = useState([])
  const [userChoice, setChoice] = useState('')
  const [playlistID, setID] = useState('')
  const [songs, setSongs] = useState([])

  let spotifyApi = new SpotifyWebApi();

  //useEffect is called when page opens, this component strips the token from the hash
  useEffect(() => {
    const hash = window.location.hash
    console.log(hash)
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

  //get selected playlist and find the playlist id
  const handlePlaylistSubmit = () => {
    console.log(userChoice)
    setID(userPlaylists.find(t => t.name === userChoice).id)
    //playlistID is empty first time?
    spotifyApi.getPlaylistTracks(userPlaylists.find(t => t.name === userChoice).id, {limit:100}).then(response =>{
      //console.log(response.items)
      setSongs(shuffleSongs(response.items))
    })
    console.log(songs)
    //console.log(userPlaylists.find(t => t.name === userChoice).id)
    playSong();
  }
  const handlePlaylistTest = () => {
    spotifyApi.setAccessToken("BQCMAKkIw0ew7E4LAb1EKun65MApm-AU1Yub3Vl_0eTFbheWgM0UDUwDCdtlpkZ3-Ot1ZseLfYiBx-9Xeed-HTeljlMoPuD64TzZK6fgzqLy_GnplfgALGilAxfZ3dPPTm3mUcaxg3pgLp-uzJYufbii08S7XZOExHrobyWGwDGb8aYA6miP6B4")
    spotifyApi.play({uris: ["spotify:track:4DrsNByVNyPkIY2ZrFYy16"]})
  }

  const playSong = async () => {
    console.log(songs[0].track.uri)
    //await spotifyApi.play({uris: songs[0].track.uri})
    spotifyApi.setAccessToken(token)
    spotifyApi.play({uris: [songs[0].track.uri]})
  }

  
  const shuffleSongs = (songs) => {
    for (let i = songs.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i+1));
      let temp = songs[i];
      songs[i] = songs[j];
      songs[j] = temp;
    }
    return songs;
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
            <select value={userChoice} onChange={e=>setChoice(e.target.value)}> 
            <option selected="selected" value="">Choose a playlist</option>
            {
              userPlaylists.map(opt=>
              <option>{opt.name}</option>)             
            }
            </select>
            <button onClick={() => {handlePlaylistSubmit()}}>Submit</button>
            <button onClick={() => {handlePlaylistTest()}}>test</button>
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