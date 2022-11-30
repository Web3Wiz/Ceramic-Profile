import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { useViewerConnection } from "@self.id/react";
import { EthereumAuthProvider } from "@self.id/web";
import { Provider } from "@self.id/react";
import { useViewerRecord } from "@self.id/react";

function Home() {
  const [connection, connect, disconnect] = useViewerConnection();

  const web3ModalRef = useRef();

  useEffect(() => {
    if (connection.status !== "connected") {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, [connection.status]);

  const getProviderOrSigner = async (needSigner = false) => {
    const currentProvider = await web3ModalRef.current.connect();
    const web3provider = new providers.Web3Provider(currentProvider);

    const { chainId } = await web3provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Please connect your wallet using Goerli testnet!");
      throw new Error("Please connect your wallet using Goerli testnet!");
    }
    return needSigner ? web3provider.getSigner() : web3provider;
  };

  const connectToSelfID = async () => {
    try {
      const _EthereumAuthProvider = await getEthereumAuthProvider();
      connect(_EthereumAuthProvider);
    } catch (error) {
      console.error(error);
    }
  };
  const getEthereumAuthProvider = async () => {
    const web3provider = await getProviderOrSigner();
    const signer = web3provider.getSigner();
    const address = await signer.getAddress();
    const _EthereumAuthProvider = new EthereumAuthProvider(
      web3provider.provider,
      address
    );
    return _EthereumAuthProvider;
  };

  return (
    <div className={styles.main}>
      <div className={styles.navbar}>
        <span className={styles.title}>Ceramic Profile</span>
        {connection.status === "connected" ? (
          <span className={styles.subtitle}>Connected</span>
        ) : (
          <button
            onClick={connectToSelfID}
            className={styles.button}
            disabled={connection.status === "connecting"}
          >
            Connect
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.connection}>
          {connection.status === "connected" ? (
            <div>
              <span className={styles.subtitle}>Your 3ID is </span>
              <h1 className={styles.id}>{connection.selfID.id}</h1>
              <ProfileUpdater />
            </div>
          ) : (
            <span className={styles.subtitle}>
              Connect with your wallet to access your 3ID and Cermaic Profile
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileUpdater() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");

  const record = useViewerRecord("basicProfile");

  useEffect(() => {
    loadProfile();
  }, [record.content]);

  const updateProfile = async () => {
    try {
      await record.merge({
        name: name,
        description: description,
        gender: gender,
        homeLocation: location,
      });

      window.alert("Your profile is updated on Ceramic Network successfully.");
    } catch (error) {
      console.error(error);
      window.alert(
        "Sorry, your profile could not be updated.\n\nError Details:\n\n\r" +
          error.error.message
      );
    }
  };
  const loadProfile = async () => {
    if (record.content) {
      setName(record.content.name);
      setDescription(record.content.description);
      setGender(record.content.gender);
      setLocation(record.content.homeLocation);
    }
  };
  return (
    <div className={styles.content}>
      <div className={styles.mt2}>
        {record.content ? (
          <div className={styles.flexCol}>
            <span className={styles.subtitle}>
              Hello {record.content.name}!
            </span>

            <span style={{ marginBottom: "10px" }}>
              Your profile is loaded from Ceramic Network. Try updating it
              below.
            </span>
          </div>
        ) : (
          <span className={styles.subtitle}>
            You do not have a profile stream attached to your 3ID. Create a
            basic profile by setting a name below.
          </span>
        )}
      </div>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />
      <textarea
        rows="4"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={styles.input}
      />
      <select
        onChange={(e) => setGender(e.target.value)}
        className={styles.select}
      >
        <option value="">--Gender--</option>
        <option value="Male" selected={gender == "Male" ? "selected" : ""}>
          Male
        </option>
        <option value="Female" selected={gender == "Female" ? "selected" : ""}>
          Female
        </option>
      </select>
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className={styles.input}
      />
      <button onClick={() => updateProfile()} className={styles.button1}>
        Update Profile
      </button>
    </div>
  );
}

export default Home;
