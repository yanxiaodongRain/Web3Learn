

export interface Card {
    rank: string;
    suit: string;
}

  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const suits = [ "♥", "♠", "♣", "♦"];

  const initialDeck = ranks.map(rank => suits.map(suit => ({ "rank":rank, "suit":suit }))).flat();

const gameState: {
    playerHand: Card[],
    dealerHand: Card[],
    deck: Card[],
    message: string,
} = {
    playerHand: [],
    dealerHand: [],
    deck: initialDeck,
    message: "",   
}


function getRandomCards(deck: Card[], count: number) {
    const randomIndexSet = new Set<number>();
    while (randomIndexSet.size < count) {
        const randomIndex = Math.floor(Math.random() * deck.length);
        randomIndexSet.add(randomIndex);
    }
    const randomCards = deck.filter((_, index) => randomIndexSet.has(index));
    const remainingDeck = deck.filter((_, index) => !randomIndexSet.has(index));
    return [ randomCards, remainingDeck ];
   
}

export function GET() { 
    //reset game state
    gameState.playerHand = [];
    gameState.dealerHand = [];
    gameState.deck = initialDeck;
    gameState.message = "";

    const [playerCards, remainingDeck] = getRandomCards(gameState.deck, 2);
    const [dealerCards, newDeck] = getRandomCards(remainingDeck, 2);
    gameState.playerHand = playerCards;
    gameState.dealerHand = dealerCards;
    gameState.deck = newDeck;
    gameState.message = "";
    return new Response(JSON.stringify({
        playerHand: gameState.playerHand,
        dealerHand: [gameState.dealerHand[0], { rank: "?", suit: "?" }] as Card[],
        message: gameState.message,
    }), { status: 200 });
}


export async function POST(request: Request) {
    //hit or stand
    const { action } = await request.json()
    if (action === "hit") { 
        const [cards, newDeck] = getRandomCards(gameState.deck, 1);
        gameState.playerHand.push(...cards);
        gameState.deck = newDeck;

        const playerHandValue = calculateHandValue(gameState.playerHand);
        if (playerHandValue === 21) {
            gameState.message = "Black Jack! Player wins!";
        } else if (playerHandValue > 21) {
            gameState.message = "Bust! Player loses!";
        }   
        
    }
    
//当stand时，我们需要帮dealer发牌，直到dealer的点数大于等于17
//dealer的点数等于21时，dealer wins
//dealer的点数大于21时，dealer loses
//dealer的点数小于21时，
//player > dealer, player wins
//dealer > player, dealer wins
//dealer == player, draw
    else if (action === "stand") {
        
        while (calculateHandValue(gameState.dealerHand) < 17) {
            const [cards, newDeck] = getRandomCards(gameState.deck, 1);
            gameState.dealerHand.push(...cards);
            gameState.deck = newDeck;
        }

        const dealerHandValue = calculateHandValue(gameState.dealerHand);
        if (dealerHandValue > 21) {
            gameState.message = "Dealer busts! Player wins!";
        } else if (dealerHandValue === 21) {
            gameState.message = "Dealer Black Jack! Player loses!";
        } else { 
            const playerHandValue = calculateHandValue(gameState.playerHand);
            if (playerHandValue > dealerHandValue) {
                gameState.message = "Player wins!";
            } else if (dealerHandValue > playerHandValue) {
                gameState.message = "Player loses!";
            } else {
                gameState.message = "Draw!";
            }
        }

     }else {
        return new Response(JSON.stringify({message: "Invalid action"}), { status: 400 });
    }
    
    return new Response(JSON.stringify({
        playerHand: gameState.playerHand,
        dealerHand: gameState.message === ""? [gameState.dealerHand[0], { rank: "?", suit: "?" }] as Card[] : gameState.dealerHand,
        message: gameState.message,
    }), { status: 200 });
}

// 当游戏开始的时候，我们需要帮player和dealer发两张牌
//当hit时，我们需要帮player发一张牌
//计算player的点数
//player的点数等于21时，player wins
//player的点数大于21时，player loses
//player的点数小于21时，游戏继续, hit or stand
function calculateHandValue(hand: Card[]) {
    let value = 0;
    let aceCount = 0;
    hand.forEach(card => {
        if (card.rank === "A") {
            value += 11;
            aceCount++;
        } else if (["K", "Q", "J"].includes(card.rank)) {
            value += 10;
        } else {
            value += parseInt(card.rank);
        }
    });
    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }
    return value;
}