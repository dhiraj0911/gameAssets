import { useContext, useEffect } from "react"
import { NFTContext } from "../context/NFTContext"
import { logo02 }  from '../assets'
const Connectwallet = () => {
    const {checkIfWalletIsConnected} =  useContext(NFTContext)

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-200">
            <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
                <div>
                    <div className="text-xl font-medium text-black">Connect Wallet</div>
                    <p className="text-gray-500">Please connect your wallet to continue.</p>
                </div>
            </div>
        </div>
    )
}

export default Connectwallet;