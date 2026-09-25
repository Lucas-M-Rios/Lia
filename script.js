import { db } from "./firebase-config.js";
import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const screens = document.querySelectorAll(".screen");

const startButton =
    document.getElementById("start-button");

const progressBar =
    document.getElementById("progress-bar");

const progressNumber =
    document.getElementById("progress-number");

const errorMessage =
    document.getElementById("error-message");

const yesButton =
    document.getElementById("yes-button");

const noButton =
    document.getElementById("no-button");

const restartNoButton =
    document.getElementById("restart-no-button");

const agreementCheckbox =
    document.getElementById("agreement-checkbox");

const acceptButton =
    document.getElementById("accept-button");

const acceptanceMessage =
    document.getElementById("acceptance-message");

const acceptanceChat =
    document.getElementById("acceptance-chat");

const acceptedMessage =
    document.getElementById("accepted-message");

const sendAcceptedMessageButton =
    document.getElementById("send-accepted-message-button");

const acceptedMessageStatus =
    document.getElementById("accepted-message-status");

const contractGif =
    document.getElementById("contract-gif");

const backgroundMusic =
    document.getElementById("background-music");

const buttonClickAudio =
    document.getElementById("button-click-audio");

const noReaction =
    document.getElementById("no-reaction");

const noReactionAudio =
    document.getElementById("no-reaction-audio");

const feelingMessage =
    document.getElementById("feeling-message");

const sendMessageButton =
    document.getElementById("send-message-button");

const messageStatus =
    document.getElementById("message-status");

let noAttempts = 0;


function showScreen(id) {

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    const screen =
        document.getElementById(id);

    if (screen) {
        screen.classList.add("active");
    }

    if (id === "screen-question") {
        noAttempts = 0;
        resetNoButtonPosition();
    }
}


function resetLoadingState() {
    errorMessage.classList.remove("visible");
    progressBar.style.width = "0%";
    progressNumber.textContent = "0%";
}


function startLoading() {

    if (backgroundMusic) {
        backgroundMusic.volume = 0.10;
        backgroundMusic.play().catch(() => {
            // El navegador puede bloquear la reproducción hasta otra interacción.
        });
    }

    resetLoadingState();
    showScreen("screen-loading");

    let progress = 0;

    const interval =
        setInterval(() => {

            progress++;

            progressBar.style.width =
                `${progress}%`;

            progressNumber.textContent =
                `${progress}%`;

            if (progress >= 87) {

                clearInterval(interval);

                setTimeout(() => {

                    errorMessage.classList.add(
                        "visible"
                    );

                    setTimeout(() => {

                        progress = 100;

                        progressBar.style.width =
                            "100%";

                        progressNumber.textContent =
                            "100%";

                        setTimeout(() => {

                            showScreen(
                                "screen-story-1"
                            );

                        }, 1800);

                    }, 1600);

                }, 200);

            }

        }, 35);
}


async function saveAnswer(answer) {
    try {
        await addDoc(collection(db, "responses"), {
            answer,
            createdAt: serverTimestamp(),
            source: "lia-page"
        });
    } catch (error) {
        console.error("Error al guardar la respuesta:", error);
    }
}


function resetNoButtonPosition() {
    if (!noButton || !yesButton) return;

    noButton.closest(".answer-buttons")?.classList.remove("swapped", "final-no");
    noButton.classList.remove("pink-after-swap");
    noButton.style.position = "relative";
    noButton.style.left = "0px";
    noButton.style.top = "0px";
    noButton.style.transform = "none";
    noButton.style.removeProperty("margin-left");
    noButton.style.removeProperty("margin-top");
}

function swapAnswerButtons() {
    noButton?.closest(".answer-buttons")?.classList.add("swapped");
}

function returnNoButtonToOriginalPlace() {
    const buttons = noButton?.closest(".answer-buttons");

    buttons?.classList.remove("swapped");
    buttons?.classList.remove("final-no");
    noButton?.classList.add("pink-after-swap");
}

function makeFinalNoLayout() {
    noButton?.closest(".answer-buttons")?.classList.add("final-no");
}

function showNoReaction(gifPath, audioPath) {
    if (!noReaction || !noReactionAudio) return;

    const reactionImage = noReaction.querySelector("img");

    if (reactionImage) {
        reactionImage.src = gifPath;
    }

    noReactionAudio.src = audioPath;
    noReactionAudio.load();

    noReaction.classList.remove("visible");
    void noReaction.offsetWidth;
    noReaction.classList.add("visible");
    noReactionAudio.currentTime = 0;

    const hideReaction = () => {
        noReaction.classList.remove("visible");
        noReactionAudio.removeEventListener("ended", hideReaction);
    };

    noReactionAudio.addEventListener("ended", hideReaction);
    noReactionAudio.play().catch(hideReaction);
}

async function getGifDuration(gifPath) {
    const response = await fetch(gifPath);
    const data = new Uint8Array(await response.arrayBuffer());
    let offset = 13;
    let frameDelay = 100;
    let totalDuration = 0;

    const screenPacked = data[10];

    if (screenPacked & 0x80) {
        offset += 3 * (2 ** ((screenPacked & 0x07) + 1));
    }

    while (offset < data.length) {
        const block = data[offset++];

        if (block === 0x3B) break;

        if (block === 0x21) {
            const label = data[offset++];

            if (label === 0xF9) {
                const blockSize = data[offset++];
                const delay = data[offset + 1] | (data[offset + 2] << 8);
                frameDelay = Math.max(delay * 10, 10);
                offset += blockSize;

                if (data[offset] === 0) offset++;
            } else {
                while (data[offset] !== 0) {
                    offset += data[offset] + 1;
                }

                offset++;
            }

            continue;
        }

        if (block === 0x2C) {
            offset += 8;
            const imagePacked = data[offset++];

            if (imagePacked & 0x80) {
                offset += 3 * (2 ** ((imagePacked & 0x07) + 1));
            }

            offset++;

            while (data[offset] !== 0) {
                offset += data[offset] + 1;
            }

            offset++;
            totalDuration += frameDelay;
            frameDelay = 100;
        }
    }

    if (!totalDuration) {
        throw new Error("No se pudo medir el GIF");
    }

    return totalDuration;
}

function showAcceptanceReaction() {
    if (!noReaction || !noReactionAudio) return;

    const reactionImage = noReaction.querySelector("img");

    const finishAcceptanceReaction = () => {
        noReaction.classList.remove("visible");
        showScreen("screen-accepted-chat");
    };

    const gifPath = "assets/gatito%20final%20besando%20luego%20del%20SI.gif";

    if (reactionImage) {
        reactionImage.src = gifPath;
    }

    noReactionAudio.src = "audio/camera-13695.mp3";
    noReactionAudio.load();
    noReaction.classList.remove("visible");
    void noReaction.offsetWidth;
    noReaction.classList.add("visible");
    noReactionAudio.currentTime = 0;
    noReactionAudio.play().catch(() => {});

    getGifDuration(gifPath)
        .then(duration => {
            setTimeout(finishAcceptanceReaction, duration);
        })
        .catch(() => {
            setTimeout(finishAcceptanceReaction, 5000);
        });
}

function playButtonClick() {
    if (!buttonClickAudio) return;

    buttonClickAudio.currentTime = 0;
    buttonClickAudio.volume = 0.45;
    buttonClickAudio.play().catch(() => {});
}

function showFinalNoSequence() {
    if (!noReaction || !noReactionAudio) return;

    const reactionImage = noReaction.querySelector("img");
    let secondGifShown = false;

    const showSecondGif = () => {
        if (secondGifShown || !reactionImage) return;

        secondGifShown = true;
        reactionImage.src = "assets/gatito%20del%20ultimo%20NO1.gif";
    };

    const finishSequence = () => {
        noReaction.classList.remove("visible");
        noReactionAudio.removeEventListener("timeupdate", switchGif);
        noReactionAudio.removeEventListener("ended", finishSequence);
    };

    const switchGif = () => {
        if (
            Number.isFinite(noReactionAudio.duration) &&
            noReactionAudio.currentTime >= noReactionAudio.duration / 2
        ) {
            showSecondGif();
        }
    };

    noReactionAudio.src = "audio/naruto-sad-music-instant.mp3";
    noReactionAudio.load();
    if (reactionImage) {
        reactionImage.src = "assets/gatito%20del%20ultimo%20NO.gif";
    }

    noReactionAudio.addEventListener("timeupdate", switchGif);
    noReactionAudio.addEventListener("ended", finishSequence);
    noReaction.classList.remove("visible");
    void noReaction.offsetWidth;
    noReaction.classList.add("visible");
    noReactionAudio.currentTime = 0;
    noReactionAudio.play().catch(finishSequence);
}


startButton?.addEventListener(
    "click",
    () => {
        playButtonClick();
        startLoading();
    }
);

restartNoButton?.addEventListener(
    "click",
    () => {
        resetLoadingState();
        noAttempts = 0;
        showScreen("screen-intro");
    }
);


document.addEventListener("click", (event) => {
    const button = event.target.closest(".next-button");

    if (!button) return;

    const buttonScreen = button.closest(".screen");

    if (!buttonScreen || !buttonScreen.classList.contains("active")) {
        return;
    }

    const next = button.dataset.next;

    if (next) {
        playButtonClick();

        if (buttonScreen.id === "screen-distance") {
            const distanceMap = buttonScreen.querySelector(".distance-map");

            if (distanceMap) {
                distanceMap.classList.add("closing");
                button.disabled = true;

                setTimeout(() => {
                    showScreen(next);
                    distanceMap.classList.remove("closing");
                    button.disabled = false;
                }, 900);

                return;
            }
        }

        showScreen(next);
    }
});


yesButton?.addEventListener(
    "click",
    () => {
        showScreen("screen-yes");
        showNoReaction(
            "assets/gatito%20feliz%20que%20apreto%20SI.gif",
            "audio/ni%C3%B1os%20celebrando.mp3"
        );
        saveAnswer("Sí");
    }
);


noButton?.addEventListener(
    "click",
    (event) => {
        event.preventDefault();

        if (noAttempts === 0) {
            noAttempts = 1;
            swapAnswerButtons();
            showNoReaction(
                "assets/gatito%20del%20primer%20NO.gif",
                "audio/faahhhhh.mp3"
            );
            saveAnswer("No");
            return;
        }

        if (noAttempts === 1) {
            noAttempts = 2;
            returnNoButtonToOriginalPlace();
            showNoReaction(
                "assets/gatito%20segundo%20NO.gif",
                "audio/Nope%20(Construction%20Worker%20TF2)%20-%20Gaming%20Sound%20Effect%20(HD)%20(320%20kbps).mp3"
            );
            return;
        }

        if (noAttempts === 3) {
            noAttempts = 4;
            showScreen("screen-final-no");
            return;
        }

        noAttempts = 3;
        resetNoButtonPosition();
        makeFinalNoLayout();
        showFinalNoSequence();
        return;
    }
);

sendMessageButton?.addEventListener(
    "click",
    async () => {
        const message = feelingMessage?.value.trim();

        if (!message) {
            if (messageStatus) {
                messageStatus.textContent = "Escribí un mensaje antes de enviarlo.";
            }
            return;
        }

        sendMessageButton.disabled = true;

        try {
            await addDoc(collection(db, "messages"), {
                message,
                createdAt: serverTimestamp(),
                source: "lia-page"
            });

            feelingMessage.value = "";
            if (messageStatus) {
                messageStatus.textContent = "Mensaje enviado. ❤️";
            }
            showScreen("screen-thanks");
        } catch (error) {
            console.error("Error al guardar el mensaje:", error);
            if (messageStatus) {
                messageStatus.textContent = "No se pudo enviar todavía. Intentá nuevamente.";
            }
        } finally {
            sendMessageButton.disabled = false;
        }
    }
);

sendAcceptedMessageButton?.addEventListener(
    "click",
    async () => {
        const message = acceptedMessage?.value.trim();

        if (!message) {
            if (acceptedMessageStatus) {
                acceptedMessageStatus.textContent = "Escribí un mensaje antes de enviarlo.";
            }
            return;
        }

        sendAcceptedMessageButton.disabled = true;

        try {
            await addDoc(collection(db, "messages"), {
                message,
                context: "accepted",
                createdAt: serverTimestamp(),
                source: "lia-page"
            });

            acceptedMessage.value = "";
            if (acceptedMessageStatus) {
                acceptedMessageStatus.textContent = "Mensaje enviado. ❤️";
            }
            showScreen("screen-thanks");
        } catch (error) {
            console.error("Error al guardar el mensaje:", error);
            if (acceptedMessageStatus) {
                acceptedMessageStatus.textContent = "No se pudo enviar todavía. Intentá nuevamente.";
            }
        } finally {
            sendAcceptedMessageButton.disabled = false;
        }
    }
);

agreementCheckbox?.addEventListener(
    "change",
    () => {
        if (acceptButton) {
            acceptButton.disabled = !agreementCheckbox.checked;
        }
    }
);

acceptButton?.addEventListener(
    "click",
    () => {
        if (!agreementCheckbox?.checked) return;

        acceptButton.disabled = true;
        agreementCheckbox.disabled = true;

        if (acceptanceMessage) {
            acceptanceMessage.classList.add("visible");
        }

        if (acceptanceChat) {
            acceptanceChat.classList.add("visible");
        }

        if (contractGif) {
            contractGif.classList.add("visible");
        }

        showAcceptanceReaction();
    }
);