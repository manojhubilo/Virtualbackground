import { Camera } from '@mediapipe/camera_utils';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { useCallback, useEffect, useState } from 'react';



function SelfieSegmentationComp() {

    const [filterValue, setUseBlur] = useState(1);

    const onResults = useCallback((results) => {
        const canvasElement = document.getElementsByClassName('output_canvas')[0];
        const canvasCtx = canvasElement.getContext('2d');
        // const isBlur = false;
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);


        // background solution start
        if (filterValue === "2") {
            canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.globalCompositeOperation = 'source-out';
            var blueprint_background = new Image();
            blueprint_background.src = '/tech-paper.png';
            blueprint_background.onload = function () {
                var pattern = canvasCtx.createPattern(this, "repeat");
                canvasCtx.fillStyle = pattern;
            };
            canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

            // Only overwrite missing pixels.
            canvasCtx.globalCompositeOperation = 'destination-atop';
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        }
        // blur solution   
        else if (filterValue === "3") {
            canvasCtx.filter = `blur(1px)`;
            canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.globalCompositeOperation = "source-in";
            canvasCtx.filter = "none";
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            canvasCtx.globalCompositeOperation = "destination-over";
            canvasCtx.filter = `blur(4px)`;
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

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await selfieSegmentation.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });
        camera.start();

        return () => {
            selfieSegmentation.close();
            camera.stop();
        }

    }, [onResults]);

    // useEffect(()=>{
    //     const canvasElement = document.getElementsByClassName('output_canvas')[0];
    //     const nextVideoElement = document.getElementById("next-video");

    //     var stream = canvasElement.captureStream(25);
    //     // Set the source of the <video> element to be the stream from the <canvas>.
    //     nextVideoElement.srcObject = stream;
    // },[filterValue])

    return (
        <div className='selfie_segmentation_container'>
            <video className="input_video" height="420" width="750"></video>
            <canvas className="output_canvas" height="420px" width="750px" ></canvas>
            <br />
            <label>filter value <input type="number" max={3} min={1} value={filterValue} onChange={(event) => { setUseBlur(event.target.value) }} /></label>
            <br/>
            {/* <video id="next-video"/> */}
        </div>
    );
}

export default SelfieSegmentationComp;