"use client";

import styles from './page.module.css'
import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";
import "../flow/config";
import Button from 'rsuite/Button';
import { Input } from 'rsuite';
import { RadioTile, RadioTileGroup } from 'rsuite';
import { Icon } from '@rsuite/icons';
import {VscWorkspaceTrusted} from 'react-icons/vsc';
import Loader from 'rsuite/Loader';
import Image from 'next/image';
import Ticker from 'react-ticker'
import { Rate } from 'rsuite';


export default function Home() {

  const [user, setUser] = useState({loggedIn: null, addr: null})
  const [nodeList, setNodeList] = useState([{name: '123', addr: '123'}, {name: '123', addr: '123'}, {name: '123', addr: '123'}, {name: '123', addr: '123'}]);
  const [node, setNode] = useState({name: '123', addr: '123'}); // nodeList[0
  const [selectedNode, setSelectedNode] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [value, setValue] = useState('');
  const [prompt, setPrompt] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [image, setImage] = useState('https://dummyimage.com/250/ffffff/000000');
  // const [images, setImages] = useState([{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'}]);  
  const [images, setImages] = useState([] as any);
  const [txid, setTxid] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if(txid){
      const interval = setInterval(() => {
        fcl.tx(txid).onceSealed().then(() => {
          fetchImages();
          setTxid(null);
          setProcessing(false);
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [txid]);

  const startInference = async () => {
    setProcessing(true);

    console.log('start inference', prompt, node.addr, user.addr)

    const result = await fcl.mutate({
      cadence: `
      import FlowNet from 0xd868d023029053e1
      import FlowNetToken from 0xd868d023029053e1
      import FungibleToken from 0x9a0766d93b6608b7


      transaction(){
          let sender: @FlowNetToken.Vault
          let vault: Capability
          let address: Address

          prepare(signer: AuthAccount){

              self.sender <- signer.borrow<&FlowNetToken.Vault>(from: FlowNetToken.VaultStoragePath)!.withdraw(amount: UFix64(1.0)) as! @FlowNetToken.Vault

              self.vault = signer.getCapability(FlowNetToken.ReceiverPublicPath)

              self.address = signer.address
          }

          execute{
              FlowNet.requestInference(
                  prompt:  "${prompt}", 
                  requestor: ${user.addr},
                  responder: ${node.addr},
                  offer: 1,
                  requestorVault: <- self.sender
              )

          }
      }           
      `,
      args: (arg, t) => [],
    });
    console.log(result); // 
  };

  const setupAccount = async () => {
    setProcessing(true);
    const result = await fcl.mutate({
      cadence: `
      import FungibleToken from 0x9a0766d93b6608b7
      import FlowNetToken from 0xd868d023029053e1
      import MetadataViews from 0x631e88ae7f1d7c20
      import NodeNFT from 0xd868d023029053e1
      import InferenceNFT from 0xd868d023029053e1
      import NonFungibleToken from 0x631e88ae7f1d7c20


      transaction () {

          prepare(signer: AuthAccount) {
              if signer.borrow<&FlowNetToken.Vault>(from: FlowNetToken.VaultStoragePath) != nil {
                  
              } else {
                  signer.save(
                      <-FlowNetToken.createEmptyVault(),
                      to: FlowNetToken.VaultStoragePath
                  )
                  signer.link<&FlowNetToken.Vault{FungibleToken.Receiver}>(
                      FlowNetToken.ReceiverPublicPath,
                      target: FlowNetToken.VaultStoragePath
                  )
                  signer.link<&FlowNetToken.Vault{FungibleToken.Balance, MetadataViews.Resolver}>(
                      FlowNetToken.VaultPublicPath,
                      target: FlowNetToken.VaultStoragePath
                  )
              }

              if signer.borrow<&NodeNFT.Collection>(from: NodeNFT.CollectionStoragePath) != nil {
                  
              } else {
                  signer.save(
                      <-NodeNFT.createEmptyCollection(),
                      to: NodeNFT.CollectionStoragePath
                  )
                  signer.link<&NodeNFT.Collection{NonFungibleToken.Receiver}>(
                      NodeNFT.CollectionPublicPath,
                      target: NodeNFT.CollectionStoragePath
                  )
              }

              if signer.borrow<&InferenceNFT.Collection>(from: InferenceNFT.CollectionStoragePath) != nil {
                  
              } else {
                  log("Create a new InferenceNFT EmptyCollection and put it in storage")
                  signer.save(
                      <-InferenceNFT.createEmptyCollection(),
                      to: InferenceNFT.CollectionStoragePath
                  )
                  signer.link<&InferenceNFT.Collection{NonFungibleToken.Receiver}>(
                      InferenceNFT.CollectionPublicPath,
                      target: InferenceNFT.CollectionStoragePath
                  )
              }

              // Get the account of the recipient and borrow a reference to their receiver
              var tokenReceiver = signer
                  .getCapability(FlowNetToken.ReceiverPublicPath)
                  .borrow<&{FungibleToken.Receiver}>()
                  ?? panic("Unable to borrow receiver reference")

              let mintedVault <- FlowNetToken.mintTokens(amount: 100.0)

              // Deposit them to the receiever
              tokenReceiver.deposit(from: <-mintedVault)
              
          }
      }
      `,      
    });
    console.log(result); // 
  };


  const rateInference = async () => {
    setProcessing(true);
    const result = await fcl.mutate({
      cadence: `
      import MetadataViews from 0x631e88ae7f1d7c20
      import FlowNet from 0xd868d023029053e1
      import FlowNetToken from 0xd868d023029053e1
      import FungibleToken from 0x9a0766d93b6608b7
      import NodeNFT from 0xd868d023029053e1
      import NonFungibleToken from 0x631e88ae7f1d7c20
      import InferenceNFT from 0xd868d023029053e1


      transaction(){

          let vault: Capability
          let tokenReciever: &{FungibleToken.Receiver}

          let senderVault: Capability<&FlowNetToken.Vault>

          let address: Address

          prepare(signer: AuthAccount){

              // Return early if the account already stores a FlowNetToken Vault
              if signer.borrow<&FlowNetToken.Vault>(from: FlowNetToken.VaultStoragePath) != nil {
                  
              } else {
                  log("Create a new FlowNetToken Vault and put it in storage")
                  // Create a new FlowNetToken Vault and put it in storage
                  signer.save(
                      <-FlowNetToken.createEmptyVault(),
                      to: FlowNetToken.VaultStoragePath
                  )

                  // Create a public capability to the Vault that only exposes
                  // the deposit function through the Receiver interface
                  signer.link<&FlowNetToken.Vault{FungibleToken.Receiver}>(
                      FlowNetToken.ReceiverPublicPath,
                      target: FlowNetToken.VaultStoragePath
                  )

                  // Create a public capability to the Vault that exposes the Balance and Resolver interfaces
                  signer.link<&FlowNetToken.Vault{FungibleToken.Balance, MetadataViews.Resolver}>(
                      FlowNetToken.VaultPublicPath,
                      target: FlowNetToken.VaultStoragePath
                  )
              }

              self.senderVault = signer.getCapability<&FlowNetToken.Vault>(/private/exampleTokenVault)

              self.tokenReciever = signer
                  .getCapability(FlowNetToken.ReceiverPublicPath)
                  .borrow<&{FungibleToken.Receiver}>()
                  ?? panic("Unable to borrow receiver reference")

              self.vault = signer.getCapability(FlowNetToken.ReceiverPublicPath)


              self.address = signer.address

          }
          execute{
              FlowNet.rateInference(
                  id: ${images.length - 1}, 
                  rating: ${rating - 1},
                  receiverCapability: self.tokenReciever,
                  rater: self.address
              )
          }
      }
      `,      
    });
    console.log(result); // 
  };

  const fetchImages = async () => {
    const result = await fcl.query({
      cadence: `
        import FlowNet from 0xd868d023029053e1
        pub fun main(): {UInt64: FlowNet.Response} {
            return FlowNet.getResponses()
        }
      `
      });
    console.log('images', result); // 1
    const keys = Object.keys(result);
    const values: any = Object.values(result);
    const resultArray = [];
    for(let i = 0; i < keys.length; i++){
      console.log(values[i].url, (values[i].url).includes('http'))
      //@ts-ignore
      const t = (values[i].url).includes('http') ? values[i].url : "https://ipfs.io/ipfs/" + values[i].url;
      const data = (await (await fetch(t)).json());
      const url = data.image.includes('http') ? data.image : "https://ipfs.io/ipfs/" + data.image;
      const prompt =  data.prompt;
      console.log(url);
      resultArray.push({link: url, description: prompt});
    }
    setImages(resultArray);
    return resultArray.length;
  };

  const getImageRatings = async () => {
    const result = await fcl.query({
      cadence: `
        import FlowNet from 0xd868d023029053e1

        pub fun main(address: Address): {UInt64: FlowNet.Rating} {
            return FlowNet.getAllRatings()
        }
      `
      });
    console.log('images', result); // 1    
  };


  const fetchNodes = async () => {
    const result = await fcl.query({
      cadence: `
        import FlowNet from 0xd868d023029053e1

        pub fun main(): {Address: FlowNet.Responder} {
            return FlowNet.getResponders()
        }
      `,
      // args: (arg, t) => null,
    });
    console.log(result); // 1
    // convert result to array
    const keys = Object.keys(result);
    const values = Object.values(result);
    const resultArray = [];
    for(let i = 0; i < keys.length; i++){
      resultArray.push({name: keys[i], addr: keys[i], data: values[i]});
    }
    setNodeList(resultArray);
  }

  useEffect(() => {fcl.currentUser.subscribe(setUser)}, []);

  useEffect(() => {
    //fetch nodelist here and set to setNodeList
    // setupAccount();
    fetchNodes();
    fetchImages();
  }, [])

  const nodeSelectionList = nodeList.map((node: any, i) => {
    console.log('nides', node);
    return (
      <RadioTile style={{width: '80vw'}} key={`node-list-${i}`}  icon={<Icon as={VscWorkspaceTrusted} />} label={`  ${node.name}`} value={`  ${node.name}-${i}`}>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignContent: 'center', alignItems: 'center'}}>
          {/* @ts-ignore */}
          {node.data && <span style={{marginRight: 38}}>Address: {node.addr} Cost: {node.data.cost} Active: {node.data.active? 'true': 'false'}</span>}
          {node.data && <Rate max={9} readOnly={true}  value={node.data.averateRating} />}
        </div>
      </RadioTile>      
    )
  })

  const logoutInternal = () => {
    // fcl.unauthenticate();
    setProcessing(false);
    setPrompt('');
    setValue('');
    setSelectedNode(null);
    // @ts-ignore
    setNode('');
    setShowImage(false);
  }

  const anotherPrompt = () => {
    rateInference();
    setProcessing(false);
    setPrompt('');
    setValue('');
    setSelectedNode(null);
    // @ts-ignore
    setNode('');
    setShowImage(false);
  }


  const waitForInference = async () => {

    const currentCount = await fetchImages();
    while (true) {
      const newCount = await fetchImages();
      if (newCount > currentCount) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    const newCount = await fetchImages();
    console.log(images[images.length - 1]);
    console.log(images);
    setImage(images[images.length - 1].link);
  }

  const triggerProcessingDone = async () => {
    await waitForInference()
    setTimeout(() => {
      setProcessing(false);
      setShowImage(true);
    }, 2000)
  };

  useEffect(() => {
    if(!user.loggedIn) logoutInternal();
    // else setupAccount();
  }, [user]);

  const gallery = images.map((image: any, i: any) => {
    return (
      <div key={i} className="responsive">
        <div className="gallery">
          <a target="_blank" href="img_5terre.jpg">
            <Image src={image.link} alt="Cinque Terre" width={512} height={512} />
          </a>
          <div className="desc">{image.description}</div>
        </div>
      </div>
    )});

  return (
    <div>      
      <main className={styles.main}>
        <h1 id="globeViz" >Generate images using AI nodes hosted on Flow blockchain</h1>

      {user.loggedIn ? <>    
          {processing && <><Loader style={{marginTop: 200}} size="lg" content="Processing" /></>}

          {!processing && <>
            {prompt != '' && !selectedNode ? <>
              <div style={{display: 'flex', alignSelf: 'start', flexDirection: 'column'}}>
                <h4 style={{margin: 4, fontSize: 18}}>Select Node:</h4>
                <RadioTileGroup onChange={(e) => {
                  console.log("On Changed")
                  console.log("Data : ", e.toString().split("-"))
                  setNode({
                    name: "Node",
                    addr: e.toString().split("-")[0]
                  })}} defaultValue="private" aria-label="Visibility Level">
                  {nodeSelectionList}
                </RadioTileGroup>
                {/* @ts-ignore */}
                <Button className='hover' appearance="primary" color="yellow" style={{padding: 12, fontSize: 20, marginTop: 16, fontWeight: 600,  width: '100%', background: '#2F476B', borderRadius: 42}} onClick={() => {setProcessing(true); setSelectedNode(node); startInference(); triggerProcessingDone();}}>Select</Button>
              </div>
              </> : <h4 style={{marginTop: 100, fontSize: 22, fontWeight: 400, display: 'flex', alignSelf: 'start'}}>
                {/* Selected Node: <span style={{marginLeft: 8, fontWeight: 800}}>{selectedNode}</span> */}
              </h4>}
          </>}

          {prompt == '' && !processing &&  user.loggedIn && <div style={{marginTop: 10, width: '100%'}}>
            <div style={{fontSize: 24, marginBottom: 12}}>Please enter a prompt to create a AI generation</div>
            <Input as="textarea" rows={3} placeholder="Please enter prompt..." onChange={(value) => {setValue(value)}}/>
            <Button onClick={() => {setPrompt(value);}} className='hover' appearance="primary" color="yellow" style={{fontSize: 20, padding: 12, marginTop: 10, fontWeight: 600,  width: '100%', background: '#2F476B', borderRadius: 42}}>Submit</Button>
          </div>}
          </> : <>
            <Button className='hover cta-button' style={{margin: 4, marginTop: 200, padding: 12, paddingLeft: 32, paddingRight: 32}} onClick={fcl.logIn}>LOG IN TO PROCEED</Button>
          </>}

          {showImage && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100}}>
          {/* {true && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100}}> */}
              <Image style={{width: 500, height: 500}} alt='' width='500' height="500" src={image} />
              {/* <Button onClick={anotherPrompt} className='hover' appearance="primary" color="yellow" style={{padding: 12, fontSize: 20, marginTop: 10, fontWeight: 600,  width: '100%', background: '#2F476B', borderRadius: 42}}>Another Prompt</Button> */}
              <div style={{marginTop: 10}}>Rate the inference: </div>
              <Rate onChange={(value: any)=> setRating(value)} defaultValue={3} max={9}/>
              <Button onClick={anotherPrompt} className='hover' appearance="primary" color="yellow" style={{padding: 12, fontSize: 20, marginTop: 10, fontWeight: 600,  width: '100%', background: '#2F476B', borderRadius: 42}}>Rate</Button>
            </div>
          }
      </main>
      {images.length > 0 && <>
        <Ticker offset="run-in" speed={5} >
            {({ index: any }) => (
                <>
                  <div style={{ whiteSpace: "nowrap", display: 'flex', margin: 4 }}>
                    {gallery}
                  </div>
                </>
            )}
          </Ticker>
          <br></br>
          <Ticker offset="run-in" speed={5} direction="toRight" >
            {({ index: any }) => (
                <>
                  <div style={{ whiteSpace: "nowrap", display: 'flex', margin: 4 }}>
                    {gallery}
                  </div>
                </>
            )}
          </Ticker>
          </>
        }
    </div>
  )
}
