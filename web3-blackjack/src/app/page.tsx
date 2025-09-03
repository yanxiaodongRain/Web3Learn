"use client"

import { init } from "next/dist/compiled/webpack/webpack";
import { useEffect, useState } from "react";


export default function Page() { 



  const [deck, setDeck] = useState<{ rank: string, suit: string }[]>([]);
  const [winner, setWinner] = useState("")
  const [message, setMessage] = useState("")
  const [playerHand, setPlayerHand] = useState<{ rank: string, suit: string }[]>([]);
  const [dealerHand, setDealerHand] = useState<{ rank: string, suit: string }[]>([])

  

  useEffect(() => { 

    const initGame = async () => {
      const response = await fetch("/api", { method: "GET" });
      const data = await response.json();
      setPlayerHand(data.playerHand)
      setDealerHand(data.dealerHand)
      setMessage(data.message)
    }

    initGame();
    
  }, [])


  async function hit() { 
    const response = await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: "hit" })
    });
    const data = await response.json();
    setPlayerHand(data.playerHand)
    setDealerHand(data.dealerHand)
    setMessage(data.message)
  }

  async function stand() { 
    const response = await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: "stand" })
    });
    const data = await response.json();
    setPlayerHand(data.playerHand)
    setDealerHand(data.dealerHand)
    setMessage(data.message)
  }

  async function reset() { 
    const response = await fetch("/api", { method: "GET" });
    const data = await response.json();
    setPlayerHand(data.playerHand)
    setDealerHand(data.dealerHand)
    setMessage(data.message)
  }

  return (
    <div className="flex flex-col gap-2 items-center justify-center h-screen bg-gray-300">
      <h1 className="text-3xl bold">Welcome to Web3 gam Black jack</h1>
      <h2 className={`text-2xl bold ${winner === "Player"? "bg-green-300" : "bg-amber-300"}`}>{message}</h2>
      <div className="mt-4">
        <h2>Dealer`s hand</h2>
        <div className="flex flex-row gap-2">
        { 
          dealerHand.map((card, index) => (
            <div key={index} className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between">
              <div className="self-start p-2 text-lg">{card.rank}</div>
              <div className="self-center p-2 text-5xl">{card.suit}</div>
              <div className="self-end p-2 text-lg">{card.rank}</div>
            </div>
          ))
          }
      </div>
      </div>

      <div>
        <h2>Player`s hand</h2>
        <div className="flex flex-row gap-2">
         { 
          playerHand.map((card, index) => (
            <div key={index} className="w-32 h-42 border-1 border-black bg-white rounded-md flex flex-col justify-between">
              <div className="self-start p-2 text-lg">{card.rank}</div>
              <div className="self-center p-2 text-5xl">{card.suit}</div>
              <div className="self-end p-2 text-lg">{card.rank}</div>
            </div>
          ))
          }
        </div>
      </div>

      <div className="flex flex-row gap-2 mt-4">
        <button onClick={ hit}  className="bg-amber-300 rounded-md p-2">Hit</button>
        <button onClick={stand} className="bg-amber-300 rounded-md p-2">Stand</button>
        <button onClick={reset} className="bg-amber-300 rounded-md p-2">Rest</button>
      </div>
    </div>
  )
}