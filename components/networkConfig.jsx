import { useNetworkMismatch, useNetwork, ChainId } from "@thirdweb-dev/react";

// Here, we show a button to the user if they are connected to the wrong network
// When they click the button, they will be prompted to switch to the desired chain
export const Network = () => {
  const isMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  return (
    <div>
      <p>{isMismatched}</p>
      {isMismatched && (
        <button onClick={() => switchNetwork(ChainId.Mainnet)}>
          Switch Network
        </button>
      )}
    </div>
  );
};