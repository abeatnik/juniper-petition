(() => {
    const canvas = document.getElementById("canvas");
    const signature = document.getElementById("signature");
    const signatureField =
        document.getElementsByClassName("signature-field")[0];
    let refreshButton;
    var ctx = canvas.getContext("2d");
    let done = false;
    let cp1x = 0;
    let cp1y = 0;
    let dataURL;

    function drawSignature(cp1x, cp1y, cp2x, cp2y, x, y) {
        ctx.beginPath();
        ctx.strokeStyle = "#9ad5f1";
        ctx.lineWidth = 2;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        ctx.stroke();
    }

    document.addEventListener("mouseup", () => {
        dataURL = canvas.toDataURL();
        signature.value = dataURL;
        done = true;
    });

    canvas.addEventListener("mousedown", (e) => {
        done = false;
        cp1x = e.offsetX;
        cp1y = e.offsetY;
        findPoints();
    });

    function findPoints() {
        setTimeout(() => {
            canvas.addEventListener(
                "mousemove",
                (e) => {
                    const cp2x = e.offsetX;
                    const cp2y = e.offsetY;
                    setTimeout(() => {
                        addEventListener(
                            "mousemove",
                            (e) => {
                                const x = e.offsetX;
                                const y = e.offsetY;
                                done === false &&
                                    drawSignature(cp1x, cp1y, cp2x, cp2y, x, y);
                                cp1x = x;
                                cp1y = y;
                                done === false && findPoints();
                            },
                            { once: true }
                        );
                    }, 8);
                },
                { once: true }
            );
        }, 8);
    }

    // canvas.addEventListener(
    //     "mousedown",
    //     (e) => {
    //         signatureField.innerHTML += '<button id="refresh">Refresh</button>';
    //         refreshButton = document.getElementById("refresh");
    //         refreshButton.addEventListener("click", (e) => {
    //             signature.value = "";
    //         });
    //     },
    //     { once: true }
    // );
})();
