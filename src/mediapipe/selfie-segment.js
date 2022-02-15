import { Camera } from '@mediapipe/camera_utils';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { useCallback, useEffect, useState } from 'react';

function SelfieSegmentationComp() {

    const [isUseBlur, setUseBlur] = useState(false);

    const onResults = useCallback((results) => {
        const canvasElement = document.getElementsByClassName('output_canvas')[0];
        const canvasCtx = canvasElement.getContext('2d');
        // const isBlur = false;
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.segmentationMask, 0, 0,
            canvasElement.width, canvasElement.height);

        // background solution start
        if (!isUseBlur) {
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
            canvasCtx.drawImage(
                results.image, 0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.restore();
        }
        // blur solution   
        else {
            canvasCtx.globalCompositeOperation = 'xor';
            canvasCtx.filter = 'blur(8px)';
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        }

        // Only overwrite missing pixels.
        canvasCtx.globalCompositeOperation = 'destination-atop';
        canvasCtx.filter = "none"
        canvasCtx.drawImage(
            results.image, 0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.restore();

    }, [isUseBlur])

    useEffect(() => {
        const videoElement = document.getElementsByClassName('input_video')[0];

        const selfieSegmentation = new SelfieSegmentation();
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

        return ()=>{
            selfieSegmentation.close();
        }

    }, [onResults]);

    return (
        <div className='selfie_segmentation_container'>
            <video className="input_video" height="420" width="750"></video>
            <canvas className="output_canvas" height="420px" width="750px" ></canvas>
            <br/>
            <label>blur only <input type="checkbox" checked={isUseBlur} onChange={() => { setUseBlur(!isUseBlur) }} /></label>
        </div>
    );
}

export default SelfieSegmentationComp;