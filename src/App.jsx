import { createEffect, createSignal, Show } from "solid-js";
import { animateTo } from "./animate";
import "./app.css";

function App() {
  const [localStream, setLocalStream] = createSignal({});
  const [isCalling, setCalling] = createSignal(false);
  const [connection, setConnection] = createSignal(null);
  const [isActive, setActive] = createSignal(false);
  const [isHidden, setHidden] = createSignal(true);
  const [camera, setCamera] = createSignal(false);
  const [mic, setMic] = createSignal(false);
  const [fullScreen, setFullScreen] = createSignal(false);
  const [call, setCall] = createSignal(null);
  const [input, setInput] = createSignal("");
  const [flip, setFlip] = createSignal(false);

  const id = (Math.random() * 10000).toString().substr(0, 4);
  let localVideo, remoteVideo, buttons;

  const peer = new Peer(id, {
    config: {
      iceServers: [
        { url: "stun:stun.zadarma.com:3478" },
        {
          url: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    },
  });

  createEffect(async () => {
    const media = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { exact: 640 },
        height: { exact: 480 },
        facingMode: `${flip() ? "environment" : "user"}`,
      },
    });
    setLocalStream(media);
  });

  function handleStream(stream) {
    remoteVideo.srcObject = stream;
    setActive(true);
    localVideo.srcObject = localStream();
  }

  function handleCall() {
    localVideo.srcObject = localStream();
    setCall(peer.call(input(), localStream()));
    call()?.on("stream", handleStream);
    setConnection(peer.connect(input()));
  }

  function handleAnswer() {
    setCalling(false);
    call()?.answer(localStream());
    call()?.on("stream", handleStream);
    setConnection(peer.connect(call()?.peer));
  }

  function handleFlipCamera() {
    setFlip(!flip());
    call().peerConnection.getSenders()[0].replaceTrack(localStream());
  }

  function toggle() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullScreen((f) => !f);
  }

  function handleSend() {
    const element = document.createElement("P");
    const span = document.createElement("SPAN");
    const t = document.createTextNode(message.value);
    span.appendChild(t);
    element.appendChild(span);
    chat.appendChild(element);
    element.classList.add("sent");
    connection?.send(JSON.stringify(message.value));
    message.value = "";
  }

  function handleHangUp() {
    call().close();
    peer.disconnect();
    peer.destroy();
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
  }

  createEffect(() => {
    isHidden() && connection()
      ? animateTo(
          buttons,
          { opacity: 0, visibility: "hidden" },
          { duration: 200 }
        )
      : animateTo(
          buttons,
          { opacity: 1, visibility: "visible" },
          { duration: 100 }
        );
  });

  peer.on("connection", function (conn) {
    conn.on("open", function () {
      conn.on("data", function (data) {
        const element = document.createElement("P");
        const span = document.createElement("SPAN");
        const t = document.createTextNode(JSON.parse(data));
        span.appendChild(t);
        element.appendChild(span);
        chat.appendChild(element);
        element.classList.add("received");
      });
    });
  });

  peer.on("call", (call) => {
    setCalling(true);
    setCall(call);
  });

  return (
    <>
      <div
        class="call"
        onClick={() => setHidden((prev) => !prev)}
        onMouseLeave={() => setHidden(true)}
      >
        <div class="videos">
          <video
            ref={localVideo}
            classList={{ "local-video": true, small: isActive() }}
            muted
            autoPlay
          ></video>
          <video
            ref={remoteVideo}
            classList={{ "remote-video": true, active: isActive() }}
            autoPlay
          ></video>
        </div>
        <Show when={isCalling()}>
          <h2 class="calling">{`The ID ${call()?.peer} is calling...`}</h2>
        </Show>
        <div ref={buttons} class="buttons">
          <label>
            ID is: {id}
            <input onInput={(e) => setInput(e.target.value)} type="text" />
          </label>
          <button
            classList={{ call: true, visiable: !isActive() }}
            aria-label="call"
            onClick={handleCall}
          >
            <img src="./images/call.svg" alt="" />
          </button>
          <button
            classList={{ answer: true, visiable: !isActive() }}
            aria-label="answer"
            onClick={handleAnswer}
          >
            <img src="./images/call.svg" alt="" />
          </button>
          <button
            classList={{ cam: true, selected: camera(), visiable: isActive() }}
            aria-label="disable camera"
            onClick={() => {
              localStream().getVideoTracks()[0].enabled = camera();
              setCamera((c) => !c);
            }}
          >
            <img
              src={
                camera()
                  ? "./images/video-camera-dark.svg"
                  : "./images/video-camera.svg"
              }
              alt=""
            />
          </button>
          <button
            classList={{ mic: true, selected: mic(), visiable: isActive() }}
            aria-label="mute"
            onClick={() => {
              localStream().getAudioTracks()[0].enabled = mic();
              setMic((m) => !m);
            }}
          >
            <img
              src={mic() ? "./images/mic-dark.svg" : "./images/mic.svg"}
              alt=""
            />
          </button>
          <button
            classList={{ "hang-up": true, visiable: isActive() }}
            aria-label="hang up"
            onClick={handleHangUp}
          >
            <img src="./images/end-call.svg" alt="" />
          </button>
          <button
            classList={{ flip: true, visiable: isActive() }}
            aria-label="flip camera"
            onClick={handleFlipCamera}
          >
            Flip
          </button>
          <button
            classList={{
              "full-screen": true,
              selected: fullScreen(),
              visiable: isActive(),
            }}
            aria-label="toggle fullscreen"
            onClick={toggle}
          >
            <img
              src={
                fullScreen()
                  ? "./images/fullscreen-dark.svg"
                  : "./images/fullscreen.svg"
              }
              alt=""
            />
          </button>
        </div>
        {/* <div class="messaging-area" classList={{ visiable: !isActive() }}>
          <div class="chat"></div>
          <div class="send">
            <input class="text" type="text" />
            <button class="send" aria-label="send message" onClick={handleSend}>
              Send
            </button>
          </div>
        </div> */}
      </div>
    </>
  );
}

export default App;
