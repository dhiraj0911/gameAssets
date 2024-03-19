import { useState, useContext, useEffect, Fragment, useRef } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, Transition } from "@headlessui/react";
import { Modal } from "antd";
import { NFTContext } from "../context/NFTContext";
import Button from "./Button";
import images from "../assets";
import AvatarEditor from "react-avatar-editor";
import axios from "axios";
import FormData from "form-data";
import {
  ConnectWallet,
  useAddress
} from "@thirdweb-dev/react";

const MenuItems = ({ isMobile, active, setActive, setIsOpen }) => {
  const generateLink = (i) => {
    switch (i) {
      case 0:
        return "/";
      case 1:
        return "/my-nfts";
      default:
        return "/";
    }
  };
  return (
    <ul
      className={`list-none flexCenter flex-row ${
        isMobile ? "flex-col h-full" : undefined
      }`}
    >
      {["Explore NFTs", "My NFTs"].map((item, i) => (
        <li
          key={i}
          onClick={() => {
            setActive(item);
            if (isMobile) setIsOpen(false);
          }}
          className={`flex flex-row items-center font-poppins text-base font-semibold dark:hover:text-white hover:text-nft-dark mx-3 ${
            active === item
              ? "dark:text-white text-nft-black-1"
              : "dark:text-nft-gray-3 text-nft-gray-2"
          }`}
        >
          <Link href={generateLink(i)}>{item}</Link>
        </li>
      ))}
    </ul>
  );
};

const ButtonGroup = ({ setActive, router, setIsOpen }) => {
  const {
    signOut,
    isSigned,
    avatar,
    setAvatar,
  } = useContext(NFTContext);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const editorRef = useRef(null);
  const currentAccount = useAddress();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCTION === "true"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:5000";
  const handleScaleChange = (e) => {
    setScale(parseFloat(e.target.value));
  };

  const handleImageChange = async (e) => {
    setImage(e.target.files[0]);
  };

  const handleChangeAvatar = () => {
    setModalIsOpen(true);
  };

  const saveAvatar = async () => {
    setModalIsOpen(false);
    try {
      let vendorId = window.localStorage.getItem("vendor");
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob(async (blob) => {
        const newImageFile = new File([blob], "resizedImage.png", {
          type: "image/png",
        });
        console.log("hit 1")
        if (vendorId) {
          console.log("hit 2")
          const formData = new FormData();
          formData.append("file", newImageFile);
          formData.append("vendorId", vendorId);
          const response = await axios.post(
            `${API_BASE_URL}/api/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("hit 3")
          const avatarurl = response.data.location;
          setAvatar(avatarurl);
          const userdata = window.localStorage.getItem("userdata");
          if (userdata) {
            let parsedData = JSON.parse(userdata);
            parsedData.avatarurl = avatarurl;
            window.localStorage.setItem("userdata", JSON.stringify(parsedData));
          }
        }
      }, "image/png");
    } catch (err) {
      console.log("error", err);
    }
    setImage(null);
    setScale(1);
  };

  return (
    <>
      {!isSigned ? (
        <>
          <Button
            btnName="Sign In"
            classStyles="mx-2 rounded-xl"
            handleClick={() => {
              setActive("");
              setIsOpen(false);
              router.push("/signin");
            }}
          />
          <Button
            btnName="Sign Up"
            classStyles="mx-2 rounded-xl"
            handleClick={() => {
              setActive("");
              setIsOpen(false);
              router.push("/signup");
            }}
          />
        </>
      ) : (
        <div className="flex flex-row">
          {currentAccount ? (
            <Button
              btnName="Mint assets"
              classStyles="mx-2 mt-1 h-10 rounded-xl"
              handleClick={() => {
                setActive("");
                setIsOpen(false);
                router.push("/game");
              }}
            />
          ) : (
            // <Button
            //   btnName="Connect"
            //   classStyles="mx-2 h-8 mt-2 rounded-xl"
            //   handleClick={connectWallet}
            // />
            <ConnectWallet/>
          )}
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="mx-2">
                <img
                  src={
                    avatar
                      ? avatar
                      : "https://vendorsprofile.s3.amazonaws.com/creator1.png"
                  }
                  className="h-12 w-12 rounded-full cursor-pointer"
                  alt="Avatar"
                />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-40 bg-white text-white dark:bg-gray-800 shadow-lg rounded-md py-2">
                <div className="py-2 font-medium">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className="px-4 py-2 text-sm text-white hover:text-black hover:bg-gray-100 w-full"
                        onClick={handleChangeAvatar}
                      >
                        Change Avatar
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className="px-4 py-2 text-sm text-red-500 hover:font-semibold hover:bg-gray-100 w-full"
                        onClick={signOut}
                      >
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      )}
      <Modal
        title="Choose Image"
        open={modalIsOpen}
        onOk={saveAvatar}
        onCancel={() => setModalIsOpen(false)}
        okButtonProps={{
          children: "Custom OK",
          style: { backgroundColor: "black", color: "white" },
        }}
      >
        <div className="text-center">
          <h2 className="text-black mb-4">Select and adjust your new Avatar</h2>
          <input type="file" onChange={handleImageChange} className="mb-4" />
          {image && (
            <div className="mb-4">
              <AvatarEditor
                ref={editorRef}
                image={image}
                width={250}
                height={250}
                border={50}
                color={[255, 255, 255, 0.6]} // RGBA
                scale={scale}
                rotate={0}
                className="mx-auto"
              />
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={scale}
                onChange={handleScaleChange}
                className="mx-auto"
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

const checkActive = (active, setActive, router) => {
  switch (router.pathname) {
    case "/":
      if (active !== "Explore NFTs") setActive("Explore NFTs");
      break;
    case "/my-nfts":
      if (active !== "My NFTs") setActive("My NFTs");
      break;
    default:
      setActive("");
  }
};

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState("Explore NFTs");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkActive(active, setActive, router);
  }, [router.pathname]);
  return (
    <nav className="flexBetween w-full fixed z-10 p-4 flex-row border-b dark:bg-nft-dark bg-white dark:border-nft-black-1 border-nft-gray-1">
      <div className="flex flex-1 flex-row justify-start items-center">
        <Link href="/">
          <a
            className="flex items-center cursor-pointer"
            onClick={() => {
              setActive("Explore NFTs");
              setIsOpen(false);
            }}
          >
            <Image src={images.logo02} width={32} height={32} alt="logo" />
            <p className="dark:text-white text-nft-black-1 font-semibold text-lg ml-1">
              GameAsset
            </p>
          </a>
        </Link>
        <div className="mx-4 h-[50px] min-h-[1em] w-px bg-gradient-to-tr from-transparent via-neutral-500 to-transparent opacity-20 dark:opacity-100"></div>

        <MenuItems active={active} setActive={setActive} />
      </div>

      <div className="flex flex-initial flex-row justify-end">
        <div className="flex items-center mr-2">
          <input
            type="checkbox"
            name="checkbox"
            id="checkbox"
            className="checkbox"
            onChange={() => setTheme(theme === "light" ? "dark" : "light")}
          />
          <label
            htmlFor="checkbox"
            className="flexBetween w-8 h-4 bg-black rounded-2xl p-1 relative label"
          >
            <i className="fas fa-sun" />
            <i className="fas fa-moon" />
            <div className="w-3 h-3 absolute bg-white rounded-full ball" />
          </label>
        </div>
        <div className="md:hidden flex">
          <div className="ml-4">
            <ButtonGroup
              setActive={setActive}
              router={router}
              setIsOpen={setIsOpen}
            />
          </div>
        </div>
      </div>
      <div className="hidden md:flex ml-2">
        {isOpen ? (
          <Image
            src={images.cross}
            width={20}
            height={20}
            alt="cross"
            onClick={() => {
              setIsOpen(false);
            }}
            className={theme === "light" ? "filter invert" : undefined}
          />
        ) : (
          <Image
            src={images.menu}
            width={25}
            height={25}
            alt="menu"
            onClick={() => {
              setIsOpen(true);
            }}
            className={theme === "light" ? "filter invert" : undefined}
          />
        )}
        {isOpen && (
          <div className=" fixed inset-0 top-65 dark:bg-nft-dark bg-white z-10 nav-h flex justify-between flex-col">
            <div className="flex-1 p-4">
              <MenuItems
                active={active}
                setActive={setActive}
                isMobile
                setIsOpen={setIsOpen}
              />
            </div>
            <div className="p-4 border-t dark:border-nft-black-1 border-nft-gray-1">
              <ButtonGroup
                setActive={setActive}
                router={router}
                setIsOpen={setIsOpen}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
