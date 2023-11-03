"use client"
import Image from 'next/image'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [meetingId, setMeetingId] = useState(null)
  const [meetingOn, setMeetingOn] = useState(true)
  const [username, setUsername] = useState(null)
  const [enteredMeetingId, setEnteredMeetingId] = useState(null)
  const [clientObj, setClientObj] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [opponentVideo, setOpponentVideo] = useState(null);
  const [opponentAudio, setOpponentAudio] = useState(null);
  const [oppoCamera, setOppoCamera] = useState(false);
  const [oppoMic, setOppoMic] = useState(false);
  const [myCamera, setMyCamera] = useState(false);
  const [myMic, setMyMic] = useState(false);


  const handleGenerateId = () => {
    setMeetingId(uuidv4)
  }

  const handleJoin = async () => {
    if (username && enteredMeetingId) {
      try {
        setMeetingOn(true)
        const res = await fetch("/api/getToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ "userId": username, "channelName": enteredMeetingId }),
        });
        const data = JSON.parse(JSON.stringify(await res.json()));
        console.log(data)
        if (res.status === 200) {
          let AgoraRTC_N4190 = require("./AgoraRTC_N-4.19.0");
          const token = data["token"];
          let localTracks = [];
          const APP_ID = "98c5588fc2e0418d92c681bfebe81ac4";
          const client = AgoraRTC_N4190.createClient({
            mode: "rtc",
            codec: "vp8",
          });
          setClientObj(client);

          const handleUserJoined = async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === "video") {
              user.videoTrack.play(`videoOppo`);
              setOpponentVideo(user.videoTrack);
              setOppoCamera(true);
            }
            if (mediaType === "audio") {
              user.audioTrack.play();
              setOpponentAudio(user.audioTrack);
              setOppoMic(true);
            }
          };
          const handleUserLeft = async (user) => {
            setOpponentVideo(null);
            setOpponentAudio(null);
            setOppoCamera(false);
            setOppoMic(false);
          };
          client.on("user-published", handleUserJoined);
          client.on("user-left", handleUserLeft);
          await client.join(APP_ID, enteredMeetingId, token, username);
          localTracks = await AgoraRTC_N4190.createMicrophoneAndCameraTracks();
          setLocalStream(localTracks);
          localTracks[1].play(`videoMe`);
          await client.publish([localTracks[0], localTracks[1]]);
          setMyCamera(true);
          setMyMic(true);
        }


      } catch (error) {
        setMeetingOn(false)
      }
    }
  }

  const leaveAndRemoveLocalStream = async () => {
    if (localStream && clientObj) {
      for (let i = 0; localStream.length > i; i++) {
        localStream[i].stop();
        localStream[i].close();
      }
      await clientObj.leave();
      setLocalStream(null);
      setClientObj(null);
      setOpponentAudio(null);
      setOpponentVideo(null);
      setMyCamera(false);
      setOppoCamera(false);
      setMyMic(false);
      setOppoMic(false);
    }
  };

  const handleToggleCamera = async (e) => {
    if (localStream) {
      if (localStream[1].muted) {
        await localStream[1].setMuted(false);
        setMyCamera(true);
      } else {
        await localStream[1].setMuted(true);
        setMyCamera(false);
      }
    }
  };

  let handleToggleMic = async (e) => {
    if (localStream) {
      if (localStream[0].muted) {
        await localStream[0].setMuted(false);
        setMyMic(true);
      } else {
        await localStream[0].setMuted(true);
        setMyMic(false);
      }
    }
  };

  const handleMuteVideoOpponent = async (e) => {
    if (opponentVideo) {
      if (opponentVideo["isPlaying"]) {
        await opponentVideo.stop();
        setOppoCamera(false);
      } else {
        await opponentVideo.play("videoOppo");
        setOppoCamera(true);
      }
    }
  };

  const handleMuteAudioOpponent = async (e) => {
    if (opponentAudio) {
      if (opponentAudio["isPlaying"]) {
        await opponentAudio.stop();
        setOppoMic(false);
      } else {
        await opponentAudio.play();
        setOppoMic(true);
      }
    }
  };

  return (
    <>
<div className="flex flex-col space-y-5 ">
  <h1 className=' p-5 font-bold text-5xl text-center'>CallCrafter!</h1>
  <div id="meetingidgenerate" className="flex mx-5 mt-5">
    <div className="bg-white w-1/2 text-black p-4">
      {meetingId ? meetingId : 'Meeting Id here'}
    </div>
    <button onClick={handleGenerateId} id="generateMeetingId" className="p-4 bg-blue-500 text-white">Generate Meeting ID</button>
  </div>

  <div id="joinmeet" className="flex flex-col space-y-5 mx-5">
    <input
      onChange={(e) => { setUsername(e.target.value) }}
      type="text"
      id="usernamefield"
      className="w-1/2 text-black p-4 bg-gray-200"
      placeholder="Username"
    />
    <div id="mainjoin" className="flex">
      <input
        onChange={(e) => { setEnteredMeetingId(e.target.value) }}
        type="text"
        className="w-1/2 text-black p-4 bg-gray-200"
        placeholder="Enter Meeting ID here"
      />
      <button onClick={handleJoin} className="p-4 bg-blue-500 text-white">Join</button>
    </div>
  </div>
</div>

<div id="videosection" className="m-4 flex space-x-3">
  <div id="me" className="flex flex-col space-y-5">
    <div id="videoMe" className="bg-white w-[40vw] h-[40vh]">
      {/* Video content */}
    </div>
    <div id="videoControlsMe" className="flex space-x-3">
      <button onClick={leaveAndRemoveLocalStream} className="p-4 bg-red-500 text-white">Leave</button>
      <button onClick={handleToggleCamera} className="p-4 bg-blue-500 text-white">{myCamera?'camera on':'camera off'}</button>
      <button onClick={handleToggleMic} className="p-4 bg-blue-500 text-white">{myMic?'mic on':'mic off'}</button>
    </div>
  </div>
  <div id="opponent" className="flex flex-col space-y-5">
    <div id="videoOppo" className="bg-white w-[40vw] h-[40vh]">
      {/* Opponent's video content */}
    </div>
    <div id="videoControlsOppo" className="flex space-x-3">
      <button onClick={handleMuteVideoOpponent} className="p-4 bg-blue-500 text-white">{oppoCamera?'camera on':'camera off'}</button>
      <button onClick={handleMuteAudioOpponent} className="p-4 bg-blue-500 text-white">{oppoMic?'mic on':'mic off'}</button>
    </div>
  </div>
</div>

    </>
  )
}
