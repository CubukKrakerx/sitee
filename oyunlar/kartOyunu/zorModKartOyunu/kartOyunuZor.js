const cards = document.querySelectorAll('.card');
let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let matchedCards = 0; // Eşleşen kart sayısı

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    hasFlippedCard = false;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.card === secondCard.dataset.card;

    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.classList.add('matched'); // Eşleşen kartlara "matched" sınıfı ekle
    secondCard.classList.add('matched'); // Eşleşen kartlara "matched" sınıfı ekle
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchedCards += 2; // Eşleşen kartları say

    if (matchedCards === cards.length) {
        document.getElementById('restartButton').style.display = 'block'; // Yeniden başla butonunu göster
    }
    resetBoard();
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

(function shuffle() {
    cards.forEach(card => {
        let randomPos = Math.floor(Math.random() * 32);
        card.style.order = randomPos;
    });
})();

cards.forEach(card => card.addEventListener('click', flipCard));

document.getElementById('restartButton').addEventListener('click', () => {
    location.reload();
});
