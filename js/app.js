const iconsType1 = [
    './images/Vulkan/image1.jpg',
    './images/Vulkan/image2.jpg',
    './images/Vulkan/image3.jpg',
    './images/Vulkan/image4.jpg',
    './images/Vulkan/image5.jpg',
    './images/Vulkan/image6.jpg',
    './images/Vulkan/image7.jpg',
    './images/Vulkan/image8.jpg',
];

const board = document.querySelector('.game-board');
const reset = document.getElementById('reset');
const replay = document.getElementById('replay');
const form = document.getElementById('form');
const difficulties = document.querySelectorAll("input[name='difficulty']");
const difficultyLabels = document.querySelectorAll("#form label");
const timer = document.getElementById('timer');
const ratingPerfect = document.getElementById('rating-perfect');
const ratingAverage = document.getElementById('rating-average');
const modal = document.querySelector('.modal');
const startHint = document.getElementById('startHint');
const resultForm = document.getElementById('submit-result-form');
const thankYouMessage = document.getElementById('thank-you-message');
const leaderboardBody = document.getElementById('leaderboard-body');

let clickCount = 0;
let selectedCards = [];
let iconClasses, sec, moves, wrongMoves, correctMoves, difficulty, difficultyClass, setTimer, selectedIcons;

// Shuffle function from https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
    var m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
}

function checkDifficulty() {
    difficultyLabels.forEach(label => {
        label.classList.remove('checked', 'active-difficulty');
    });
    [].forEach.call(difficulties, function (input) {
        if (input.value === 'type1' && input.checked === true) {
            difficulty = 16;
            difficultyClass = 'normal';
            input.nextElementSibling.classList.add('checked', 'active-difficulty');
            selectedIcons = iconsType1;
        }
    });
}

function populate(num) {
    iconClasses = [];
    clickCount = 0;
    board.innerHTML = '';

    shuffle(selectedIcons);
    let uniqueImages = [...new Set(selectedIcons)];
    let boardIcons = uniqueImages.slice(0, num / 2);
    boardIcons = boardIcons.flatMap(image => [image, image]);
    shuffle(boardIcons);

    const fragment = document.createDocumentFragment();
    for (let x = 0; x < num; x++) {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container', difficultyClass);
        const front = document.createElement('div');
        const back = document.createElement('div');
        front.classList.add('card', 'front');
        back.classList.add('card', 'back');
        const icon = document.createElement('img');
        icon.src = boardIcons[x];
        icon.classList.add('icon');
        back.appendChild(icon);

        cardContainer.appendChild(front);
        cardContainer.appendChild(back);
        fragment.appendChild(cardContainer);
    }
    board.appendChild(fragment);
}

function stopwatch() {
    sec += 1;
    if (sec < 60) {
        timer.innerText = sec;
    } else if (sec < 3600) {
        let minutes = Math.floor(sec / 60);
        let seconds = sec % 60;
        timer.innerText = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
}

function updateRatingStars() {
    switch (difficultyClass) {
        case 'normal':
            if (moves >= 15 && !ratingPerfect.classList.contains('hide')) {
                ratingPerfect.classList.add('hide');
            }
            if (moves >= 20 && !ratingAverage.classList.contains('hide')) {
                ratingAverage.classList.add('hide');
            }
            break;
    }
}

function calculateScore(time, moves) {
    // Simple score calculation: lower time and moves = higher score
    return Math.round(10000 / (time + moves));
}

function checkwin(num) {
    let won;
    switch (difficultyClass) {
        case 'normal':
            if (num === 8) {
                won = true;
            }
            break;
    }
    if (won === true) {
    setTimeout(function () {
        const finalTime = timer.innerText;
        const finalMoves = moves;
        document.getElementById('final-time').innerText = finalTime;
        document.getElementById('final-moves').innerText = finalMoves;
        document.getElementById('final-rating').innerHTML = document.getElementById('stars').innerHTML;
        document.getElementById('game-time').value = sec;
        document.getElementById('game-moves').value = moves;
        document.getElementById('game-score').value = calculateScore(sec, moves);

        // 🟢 Call this BEFORE showing modal to make sure hrefs are ready
        updateShareLinks();

        modal.classList.remove('hide');
        resultForm.style.display = 'block';
        thankYouMessage.style.display = 'none';
        updateLeaderboard();
        clearInterval(setTimer);
    }, 1000);
  }
}



function matchChecker(e) {
    if (e.target.classList.contains('card') && !e.target.classList.contains('front-open')) {
        if (startHint && startHint.classList.contains('show')) {
            startHint.classList.remove('show');
            localStorage.setItem('memoryGameStarted', 'true');
        }

        e.target.classList.add('front-open');
        e.target.nextElementSibling.classList.add('back-open');
        selectedCards.push(e.target);
        clickCount += 1;

        if (clickCount === 2) {
            clickCount = 0;
            moves += 1;
            document.getElementById('moves').innerHTML = moves;
            updateRatingStars();

            board.removeEventListener('click', matchChecker);
            setTimeout(function () {
                board.addEventListener('click', matchChecker);
            }, 700);

            if (selectedCards[0].nextElementSibling.firstChild.src === selectedCards[1].nextElementSibling.firstChild.src) {
                console.log('match');
                correctMoves += 1;
                checkwin(correctMoves);
                selectedCards.forEach(card => {
                    card.classList.add('front-correct');
                    card.nextElementSibling.classList.add('back-correct');
                });
                selectedCards = [];
            } else {
                console.log('not match');
                wrongMoves += 1;
                setTimeout(function () {
                    selectedCards.forEach(card => {
                        card.classList.remove('front-open');
                        card.nextElementSibling.classList.remove('back-open');
                    });
                    selectedCards = [];
                }, 700);
            }
        }
    }
}

function updateShareLinks() {
    console.log("Running updateShareLinks..."); // 🔍 Confirm it's running

    const time = document.getElementById('final-time').innerText || '0';
    const moves = document.getElementById('final-moves').innerText || '0';
    const gameUrl = window.location.href;

    const message = `Razbio/la sam Pertini memorijsku igru za ${time} sekundi i ${moves} poteza! Memoriši. Poveži. Osvoji i ti 10% ovde: ${gameUrl}`;
    const encodedMessage = encodeURIComponent(message);

    document.getElementById('shareFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}&quote=${encodedMessage}`;
    document.getElementById('shareWhatsApp').href = `https://wa.me/?text=${encodedMessage}`;
    document.getElementById('shareViber').href = `viber://forward?text=${encodedMessage}`;
    document.getElementById('shareTelegram').href = `https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodedMessage}`;
}



function updateLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    leaderboardBody.innerHTML = '';
    leaderboard.sort((a, b) => b.score - a.score).slice(0, 5).forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${entry.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${entry.time}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${entry.moves}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

resultForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const time = document.getElementById('game-time').value;
    const moves = document.getElementById('game-moves').value;
    const score = document.getElementById('game-score').value;

    // Simulate saving to leaderboard using localStorage
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    leaderboard.push({ name, email, time, moves, score });
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Show thank you message and hide form
    thankYouMessage.style.display = 'block';
    resultForm.style.display = 'none';

    // Update leaderboard display
    updateLeaderboard();

    // Reset form
    resultForm.reset();
});

function startGame() {
    sec = 0;
    moves = 0;
    wrongMoves = 0;
    correctMoves = 0;
    timer.innerText = '0';
    document.getElementById('moves').innerHTML = '0';
    modal.classList.add('hide');
    document.getElementById('final-time').innerText = ''; // Reset final-time
    document.getElementById('final-moves').innerText = ''; // Reset final-moves
    document.getElementById('final-rating').innerHTML = ''; // Reset final-rating
    ratingPerfect.classList.remove('hide');
    ratingAverage.classList.remove('hide');
    resultForm.style.display = 'block';
    thankYouMessage.style.display = 'none';
    clearInterval(setTimer);

    checkDifficulty();
    populate(difficulty);

    if (!localStorage.getItem('memoryGameStarted')) {
        startHint.classList.add('show');
    } else {
        startHint.classList.remove('show');
    }

    board.addEventListener('click', function clickOnce() {
        clearInterval(setTimer);
        setTimer = setInterval(stopwatch, 1000);
        board.removeEventListener('click', clickOnce);
    });
}

reset.addEventListener('click', startGame);
replay.addEventListener('click', startGame);
form.addEventListener('change', function (event) {
    if (event.target.name === 'difficulty') {
        startGame();
    }
});

document.getElementById('replay').addEventListener('click', startGame);

modal.addEventListener('click', function (e) {
    e.stopPropagation();
});

board.addEventListener('click', matchChecker);



const openBtn = document.getElementById('openGameButton');
const overlay = document.getElementById('memoryGameOverlay');
const panel = document.getElementById('memoryGamePanel');
const closeBtn = panel.querySelector('.close-btn');

openBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    panel.classList.add('open');
    overlay.removeAttribute('inert');
    closeBtn.focus();
});

closeBtn.addEventListener('click', closePanel);

overlay.addEventListener('click', e => {
    if (e.target === overlay) closePanel();
});

function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    overlay.setAttribute('inert', '');
    openBtn.focus();
}

// Remove duplicate window.load listener and updateShareLinks call
window.addEventListener('load', () => {
    startGame();
    updateLeaderboard();
    // Removed updateShareLinks() from here
});






