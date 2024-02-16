import { useEffect, useRef, useState, useContext, useMemo } from "react";

import Image from "next/image";
import { useTheme } from "next-themes";

import { NFTContext } from "../context/NFTContext";
import { Banner, CreatorCard, Loader, NFTCard, SearchBar } from "../components";
import images from "../assets";
import { shortenAddress } from "../utils/shortenAddress";
import { getTopCreators } from "../utils/getTopCreators";
import Connectwallet from "./connectwallet";

const Home = () => {
  const [hideButtons, setHideButtons] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchNFTs, currentAccount, isSigned, isSingedUp } =
    useContext(NFTContext);
  const [activeSelect, setActiveSelect] = useState("Recently added");
  const parentRef = useRef(null);
  const scrollRef = useRef(null);
  const { theme } = useTheme();
  const [rentNfts, setRentNfts] = useState([]);
  const [saleNfts, setSaleNfts] = useState([]);

  const [searchQueryRent, setSearchQueryRent] = useState("");
  const [sortOptionRent, setSortOptionRent] = useState("Recently added");
  const [searchQuerySale, setSearchQuerySale] = useState("");
  const [sortOptionSale, setSortOptionSale] = useState("Recently added");

  const filteredRentNfts = useMemo(() => {
    let filtered = rentNfts.filter((nft) =>
      nft.name.toLowerCase().includes(searchQueryRent.toLowerCase())
    );

    if (sortOptionRent === "Recently added") {
      filtered.sort((a, b) => b.tokenId - a.tokenId);
    }

    return filtered;
  }, [rentNfts, searchQueryRent, sortOptionRent]);

  const filteredSaleNfts = useMemo(() => {
    let filtered = saleNfts.filter((nft) =>
      nft.name.toLowerCase().includes(searchQuerySale.toLowerCase())
    );

    if (sortOptionSale === "Recently added") {
      filtered.sort((a, b) => b.tokenId - a.tokenId);
    }

    return filtered;
  }, [saleNfts, searchQuerySale, sortOptionSale]);

  useEffect(() => {
    fetchNFTs().then((items) => {
      const itemsForRent = [];
      const itemsForSale = [];

      items.forEach((item) => {
        if (item.forRent) {
          itemsForRent.push(item);
        }
        if (item.forSale) {
          itemsForSale.push(item);
        }
      });
      setRentNfts(itemsForRent);
      setSaleNfts(itemsForSale);
      setIsLoading(false);
    });
  }, []);

  // useEffect(() => {
  //   fetchNFTs().then((items) => {
  //     setNfts(items);
  //     console.log(items)
  //     setNftsCopy(items);
  //     setIsLoading(false);
  //   });
  // }, []);

  const handleScroll = (direction) => {
    const { current } = scrollRef;
    const scrollAmount = window.innerWidth > 1000 ? 270 : 210;
    if (direction === "left") {
      current.scrollLeft -= scrollAmount;
    } else {
      current.scrollLeft += scrollAmount;
    }
  };

  const isScrollable = () => {
    const { current } = scrollRef;
    const { current: parent } = parentRef;
    if (current?.scrollWidth >= parent?.offsetWidth) {
      setHideButtons(false);
    } else {
      setHideButtons(true);
    }
  };

  useEffect(() => {
    const sortedNfts = [...nfts];

    switch (activeSelect) {
      case "Price (low to high)":
        setNfts(sortedNfts.sort((a, b) => a.price - b.price));
        break;
      case "Price (high to low)":
        setNfts(sortedNfts.sort((a, b) => b.price - a.price));
        break;
      case "Recently added":
        setNfts(sortedNfts.sort((a, b) => b.tokenId - a.tokenId));
        break;
      default:
        setNfts(nfts);
        break;
    }
  }, [activeSelect]);

  const onHandleSearch = (value) => {
    const filteredNfts = nfts.filter(({ name }) =>
      name.toLowerCase().includes(value.toLowerCase())
    );

    if (filteredNfts.length) {
      setNfts(filteredNfts);
    } else {
      setNfts(nftsCopy);
    }
  };

  const onClearSearch = () => {
    if (nfts.length && nftsCopy.length) {
      setNfts(nftsCopy);
    }
  };

  useEffect(() => {
    isScrollable();
    window.addEventListener("resize", isScrollable);

    return () => {
      window.removeEventListener("resize", isScrollable);
    };
  });

  if ((isSigned || isSingedUp) && currentAccount === "") {
    console.log(currentAccount);
    return <Connectwallet />;
  } else {
    const creators = getTopCreators(nftsCopy);

    return (
      <div className="flex justify-center ms:px-4 p-12">
        <div className="w-full minmd:w-4/5">
          <Banner
            name={
              <>
                Discover, collect, sell and rent <br /> extraordinary GameAssets
              </>
            }
            parentStyles="justify-start mb-6 h-72 sm:h-60 p-12 xs:p-4 xs:h-44 rounded-3xl"
            childStyles="md:text-4xl sm:text-2xl xs:text-xl text-left"
          />

          {rentNfts.length === 0 && saleNfts.length === 0 ? (
            <>
              <Loader />
            </>
          ) : (
            <>
              {/* <div>
                  <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0">
                    Top Sellers
                  </h1>
                  <div
                    className="relative flex-1 max-w-full flex mt-3"
                    ref={parentRef}
                  >
                    <div
                      className="flex flex-row w-max overflow-x-scroll no-scrollbar select-none"
                      ref={scrollRef}
                    >
                      {creators.sort((a, b) => b.sumall - a.sumall).map((creator, i) => (
                        <CreatorCard
                          key={creator.seller}
                          rank={i + 1}
                          creatorImage={images[`creator${i + 1}`]}
                          creatorName={shortenAddress(creator.seller)}
                          creatorEths={creator.sumall}
                        />
                      )).slice(0, 8)}
                      {!hideButtons && (
                        <>
                          <div
                            onClick={() => handleScroll('left')}
                            className="absolute w-8 h-8 minlg:w-12 minlg:h-12 top-45 cursor-pointer left-0"
                          >
                            <Image
                              src={images.left}
                              layout="fill"
                              objectFit="contain"
                              alt="left-arrow"
                              className={
                                theme === 'light' ? 'filter invert' : undefined
                              }
                            />
                          </div>
                          <div
                            onClick={() => handleScroll('right')}
                            className="absolute w-8 h-8 minlg:w-12 minlg:h-12 top-45 cursor-pointer right-0"
                          >
                            <Image
                              src={images.right}
                              layout="fill"
                              objectFit="contain"
                              alt="left-arrow"
                              className={
                                theme === 'light' ? 'filter invert' : undefined
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div> */}
              <div className="mt-10">
                {/* <div className="flexBetween mx-4 xs:mx-0 minlg:mx-8 sm:flex-col sm:items-start">
                    <h1 className="flex-1 font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold sm:mb-4">
                      Hot NFTs for Rent
                    </h1>
                    <div className="flex-2 sm:w-full flex flex-row sm:flex-col">
                      <SearchBar
                        activeSelect={sortOptionRent}
                        setActiveSelect={setSortOptionRent}
                        handleSearch={(value) => setSearchQueryRent(value)}
                        clearSearch={() => setSearchQueryRent('')}
                      />
                    </div>
                  </div> */}
                {/* <div className="mt-3 w-full flex flex-wrap justify-start md:justify-center"> */}
                {/* {nfts.map((nft) => (
                      <NFTCard key={nft.tokenId} nft={nft} />
                    ))} */}
                {/* {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <NFTCard
                    key={`nft-${i}`}
                    nft={{
                      i,
                      name: `Nifty NFT ${i}`,
                      price,
                      seller,
                      owner,
                      description: 'Cool NFT on Sale',
                    }}
                  />
                ))} */}

                {/* </div> */}
                {rentNfts.length > 0 ? (
                  <div className="mt-10 mb-10">
                    <div className="flex items-center">
                      <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold">
                        NFTs for Rent
                      </h1>
                      <div
                        className=""
                        style={{ width: "700px", marginLeft: "100px" }}
                      >
                        {" "}
                        {/* Adjust the width as needed */}
                        {/* Search and Sort for Rent NFTs */}
                        <SearchBar
                          activeSelect={sortOptionRent}
                          setActiveSelect={setSortOptionRent}
                          handleSearch={(value) => setSearchQueryRent(value)}
                          clearSearch={() => setSearchQueryRent("")}
                        />
                      </div>
                    </div>
                    <div className="mt-3 w-full flex flex-wrap justify-start md:justify-center">
                      {filteredRentNfts.map(
                        (nft) =>
                          !nft.rented && <NFTCard key={nft.tokenId} nft={nft} />
                      )}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                {saleNfts.length > 0 ? (
                  <div className="mt-10">
                    <div className="flex items-center">
                      <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold">
                        NFTs for Sale
                      </h1>
                      <div
                        className=""
                        style={{ width: "700px", marginLeft: "100px" }}
                      >
                        {" "}
                        {/* Adjust the width and margin as needed */}
                        {/* Search and Sort for Sale NFTs */}
                        <SearchBar
                          activeSelect={sortOptionSale}
                          setActiveSelect={setSortOptionSale}
                          handleSearch={(value) => setSearchQuerySale(value)}
                          clearSearch={() => setSearchQuerySale("")}
                        />
                      </div>
                    </div>
                    <div className="mt-3 w-full flex flex-wrap justify-start md:justify-center">
                      {filteredSaleNfts.map(
                        (nft) =>
                          !nft.rented && <NFTCard key={nft.tokenId} nft={nft} />
                      )}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
};

export default Home;
