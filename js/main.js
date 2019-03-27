'use strict';

const width = 640;
const height = 480;
const block = 16;

const framesPerSecond = 25;
const videoRefresh = Math.round(1000 / framesPerSecond)

const lines = height/block;
const timePerRedraw = 1000 / lines;
const redrawsPerSecond = 5;
const pixelRefresh = Math.round(timePerRedraw / redrawsPerSecond);

const videoElement = document.querySelector('video');
const videoCanvasElement = document.querySelector('#video-canvas');

videoElement.height = height
videoElement.width = width

videoCanvasElement.height = height
videoCanvasElement.width = width

const videoSelect = document.querySelector('select#videoSource');
const videoContext = videoCanvasElement.getContext('2d');

let videoRenderTimer = null;
let pixelRenderTimer = null;

function gotDevices(deviceInfos) {
  const value = videoSelect.value;

  while (videoSelect.firstChild) {
    videoSelect.removeChild(videoSelect.firstChild);
  }

  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }

  videoSelect.value = value;
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;

  var blocksX = Math.ceil(videoElement.width / block);
  var blocksY = Math.ceil(videoElement.height / block);

  if (videoRenderTimer) {
    clearInterval(videoRenderTimer);
  }

  if (pixelRenderTimer) {
    clearInterval(pixelRenderTimer);
  }

  let j = 0

  videoRenderTimer = setInterval(function () {
    try {
      videoContext.drawImage(videoElement, 0, 0, width, height);
    } catch (e) {
      console.error(e);
    }
  }, videoRefresh);

  pixelRenderTimer = setInterval(function () {
    try {
        let imageData = videoContext.getImageData((i * block), (j * block), block, block);

        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;

        for (let k = 0; k < imageData.data.length; k += 4) {
          r += imageData.data[k];
          g += imageData.data[k + 1];
          b += imageData.data[k + 2];
          a += imageData.data[k + 3];
        }

        
    } catch (e) {
      console.error(e);
    }
  }, pixelRefresh);

  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  const videoSource = videoSelect.value;

  const constraints = {
    video: {
      deviceId: videoSource ? {
        exact: videoSource
      } : undefined,
      width: {
        exact: 640
      },
      height: {
        exact: 480
      }
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

videoSelect.onchange = start;
