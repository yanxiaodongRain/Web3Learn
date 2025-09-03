"use client"

import { init } from "next/dist/compiled/webpack/webpack";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage} from "wagmi";


export default function Page() { 



  const [deck, setDeck] = useState<{ rank: string, suit: string }[]>([]);
  const [message, setMessage] = useState("")
  const [playerHand, setPlayerHand] = useState<{ rank: string, suit: string }[]>([]);
  const [dealerHand, setDealerHand] = useState<{ rank: string, suit: string }[]>([])
  const [score, setScore] = useState(0)
  const [isSigned, setIsSigned] = useState(false)

  const {address, isConnected} = useAccount()
  const { signMessageAsync} = useSignMessage()

   const initGame = async () => {
      const response = await fetch("/api", { method: "GET" });
      const data = await response.json();
      setPlayerHand(data.playerHand)
      setDealerHand(data.dealerHand)
      setMessage(data.message)
      setScore(data.score)

    }


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
    setScore(data.score)
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
    setScore(data.score)
  }

  async function reset() { 
    const response = await fetch("/api", { method: "GET" });
    const data = await response.json();
    setPlayerHand(data.playerHand)
    setDealerHand(data.dealerHand)
    setMessage(data.message)
    setScore(data.score)
  }

  async function handleSign() {
    const message = `Welcome to the game Black jack at ${new Date().toLocaleString()}`;
    const signature = await signMessageAsync({ message });
    const response = await fetch("/api", { method: "POST" ,body:  JSON.stringify({ action: "auth", address,message,signature})});
    if(response.status === 200){
      setIsSigned(true)
      initGame();
    }
  }


  if(!isSigned){
return (
  <div className="flex flex-col gap-2 items-center justify-center h-screen bg-gray-300">
    <ConnectButton />
    <button onClick={handleSign} className="border-black bg-amber-300 p-2 rounded-md">Sign with your wallet</button>
  </div>
)
  }

  return (
    <div className="flex flex-col gap-2 items-center justify-center h-screen bg-gray-300">
      <ConnectButton />
      <h1 className="text-3xl bold">Welcome to Web3 gam Black jack</h1>
      <h2 className="text-3xl bold">{`Score: ${score}`}</h2>
      <h2 className={`text-2xl bold ${message.includes("win")? "bg-green-300" : "bg-amber-300"}`}>{message}</h2>
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
      {
        message === ""?
        <>
          <button onClick={ hit}  className="bg-amber-300 rounded-md p-2">Hit</button>
        <button onClick={stand} className="bg-amber-300 rounded-md p-2">Stand</button>
        </>:
        <button onClick={reset} className="bg-amber-300 rounded-md p-2">Rest</button>
      }
      </div>
    </div>
  )
}