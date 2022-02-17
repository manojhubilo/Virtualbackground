
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { useCallback, useEffect, useState } from 'react';


function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    return dataURL
}

const getImage = (src) => {
    return new Promise((resolve) => {
        const tempImage = new Image();
        tempImage.onloadeddata = () => {
            resolve(getBase64Image(tempImage));
        }
        tempImage.src = src;
    })


}


function SelfieSegmentationComp() {

    const [filterValue, setUseBlur] = useState("1");

    const onResults = useCallback((results) => {
        const canvasElement = document.getElementsByClassName('output_canvas')[0];
        const canvasCtx = canvasElement.getContext('2d');
        // const isBlur = false;
        // canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);


        // background solution start
        if (filterValue === "3") {
            canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.globalCompositeOperation = 'source-out';
            canvasCtx.filter = `blur(${0}px)`;

            const bgImageSrc = '/tech-paper.png';
           // const bgImageSrc = 'https://i.redd.it/vo9vm1fcqrp71.jpg';

            const tempImage = new Image();
            tempImage.src = bgImageSrc;

            canvasCtx.drawImage(tempImage, 0, 0, canvasElement.width, canvasElement.height);
            // Only overwrite missing pixels.
            canvasCtx.globalCompositeOperation = 'destination-atop';
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);


            // new

          /*   getImage(bgImageSrc).then((base64URL) => {
                const tempImage = new Image();
                tempImage.src = base64URL;
                canvasCtx.drawImage(tempImage, 0, 0, canvasElement.width, canvasElement.height);
                canvasCtx.globalCompositeOperation = 'destination-atop';
                canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
            }) */




        }
        // blur solution   
        else if (filterValue === "2") {
            canvasCtx.filter = `blur(12px)`;
            canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.globalCompositeOperation = "source-in";
            canvasCtx.filter = "none";
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            canvasCtx.globalCompositeOperation = "destination-over";
            canvasCtx.filter = `blur(10px)`;
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

        }
        // normal
        else {
            canvasCtx.globalCompositeOperation = "copy";
            canvasCtx.filter = "none";
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        }

        canvasCtx.restore();
    }, [filterValue])

    useEffect(() => {
        const videoElement = document.getElementsByClassName('input_video')[0];

        const selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
            }
        });
        selfieSegmentation.setOptions({
            modelSelection: 1,
            effect: 'background',
        });
        selfieSegmentation.onResults(onResults);

        // const camera = new Camera(videoElement, {
        //     onFrame: async () => {
        //         await selfieSegmentation.send({ image: videoElement });
        //     },
        //     width: 750,
        //     height: 420
        // });
        // camera.start();
        let timeoutValue;
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: { facingMode: 'user', frameRate: 10, width: 640, height: 400 }
            }).then((stream) => {
                console.log("getStream", stream)
                async function computeFrame() {
                    await selfieSegmentation.send({ image: videoElement });
                    timeoutValue = setTimeout(computeFrame, 50);
                }
                videoElement.oncanplay = computeFrame;
                videoElement.srcObject = stream;
                videoElement.onloadedmetadata = function (e) {
                    videoElement.play();
                };

            }).catch((err) => {
                console.log(err)
            })

        return () => {
            if (timeoutValue) clearTimeout(timeoutValue);
            selfieSegmentation.reset();
            selfieSegmentation.close();
            // camera.stop();
        }

    }, [onResults]);

    useEffect(() => {
        setTimeout(() => {
            const canvasElement = document.getElementsByClassName('output_canvas')[0];
            const nextVideoElement = document.getElementById("next-video");

            var stream = canvasElement.captureStream();
            nextVideoElement.srcObject = stream;

            nextVideoElement.onloadedmetadata = function (e) {
                nextVideoElement.play();
            };
        }, 3000)
    }, [filterValue])

    return (
        <div className='selfie_segmentation_container'>
            {/* <img id="bgImg" alt="abc" src="https://i.redd.it/vo9vm1fcqrp71.jpg" height="400" width="640" hidden /> */}
            <video hidden className="input_video" height="400" width="640"></video>
            <canvas hidden className="output_canvas" height="400px" width="640px" ></canvas>
            <br />
            <label>filter value <input type="number" max={3} min={1} value={filterValue} onChange={(event) => { setUseBlur(event.target.value) }} /></label>
            <br />
            <video id="next-video" />
        </div>
    );
}

export default SelfieSegmentationComp;