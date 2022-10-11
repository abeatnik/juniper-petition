(() => {
    const icon = document.getElementsByClassName("sound-icon")[0];
    const soundscape = document.getElementsByClassName("soundscape")[0];
    const htmlMute = '<iconify-icon icon="codicon:mute"></iconify-icon>';
    const htmlUnmute = '<iconify-icon icon="codicon:unmute"></iconify-icon>';
    const audio = soundscape.getElementsByTagName("audio")[0];

    soundscape.addEventListener("click", (e) => {
        if (icon.classList.contains("mute")) {
            icon.classList.remove("mute");
            icon.innerHTML = htmlUnmute;
            audio.play();
        } else {
            icon.classList.add("mute");
            icon.innerHTML = htmlMute;
            audio.pause();
        }
    });

    if (icon.classList.contains("autoplay")) {
        document.addEventListener(
            "click",
            (e) => {
                icon.classList.remove("mute");
                icon.innerHTML = htmlUnmute;
                audio.play();
            },
            { once: true }
        );
    }
})();
