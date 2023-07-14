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



export default function Home() {

  const [user, setUser] = useState({loggedIn: null, addr: null})
  const [nodeList, setNodeList] = useState([{name: '123', addr: '123'}, {name: '123', addr: '123'}, {name: '123', addr: '123'}, {name: '123', addr: '123'}]);
  const [node, setNode] = useState(''); // nodeList[0
  const [selectedNode, setSelectedNode] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [value, setValue] = useState('');
  const [prompt, setPrompt] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [image, setImage] = useState('https://dummyimage.com/250/ffffff/000000');

  useEffect(() => {fcl.currentUser.subscribe(setUser)}, []);

  useEffect(() => {
    //fetch nodelist here and set to setNodeList
    // TODO: fetch nodelist from server
  }, [])
  console.log(user);

  const nodeSelectionList = nodeList.map((node: any, i) => {
    console.log(node);
    return (
      <RadioTile style={{width: '80vw'}} key={`node-list-${i}`}  icon={<Icon as={VscWorkspaceTrusted} />} label={`${node.name}`} value={`${node.name}-${i}`}>
        Address: {node.addr}
      </RadioTile>      
    )
  })

  const logoutInternal = () => {
    // fcl.unauthenticate();
    setProcessing(false);
    setPrompt('');
    setValue('');
    setSelectedNode(null);
    setNode('');
    setShowImage(false);
  }

  const anotherPrompt = () => {
    setProcessing(false);
    setPrompt('');
    setValue('');
    setSelectedNode(null);
    setNode('');
    setShowImage(false);
  }

  const triggerProcessingDone = () => {
    setTimeout(() => {
      setProcessing(false);
      setShowImage(true);
    }, 2000)
  };

  useEffect(() => {
    if(!user.loggedIn) logoutInternal();
  }, [user]);

  return (
    <div>      
      <main className={styles.main}>

      {user.loggedIn ? <>    
          {processing && <><Loader style={{marginTop: 200}} size="lg" content="Processing" /></>}

          {!processing && <>
            {prompt != '' && !selectedNode ? <>
              <div style={{display: 'flex', alignSelf: 'start', flexDirection: 'column'}}>
                <h4 style={{margin: 4, fontSize: 18}}>Select Node:</h4>
                <RadioTileGroup onChange={(e) => setNode(e.toString())} defaultValue="private" aria-label="Visibility Level">
                  {nodeSelectionList}
                </RadioTileGroup>
                <Button className='hover' appearance="primary" color="yellow" style={{padding: 12, fontSize: 20, marginTop: 16, fontWeight: 600,  width: '100%', background: '#0353E9'}} onClick={() => {setProcessing(true); setSelectedNode(node); triggerProcessingDone();}}>Select</Button>
              </div>
              </> : <h4 style={{marginTop: 100, fontSize: 22, fontWeight: 400, display: 'flex', alignSelf: 'start'}}>
                {/* Selected Node: <span style={{marginLeft: 8, fontWeight: 800}}>{selectedNode}</span> */}
              </h4>}
          </>}

          {prompt == '' && !processing &&  user.loggedIn && <div style={{marginTop: 10, width: '100%'}}>
            <Input as="textarea" rows={3} placeholder="Enter prompt..." onChange={(value) => {setValue(value)}}/>
            <Button onClick={() => {setPrompt(value)}} className='hover' appearance="primary" color="yellow" style={{fontSize: 20,marginTop: 10, fontWeight: 600,  width: '100%', background: '#0353E9'}}>Submit</Button>
          </div>}
          </> : <>
            <Button className='hover cta-button' style={{margin: 4, marginTop: 200}} onClick={fcl.logIn}>LOG IN TO PROCEED</Button>
          </>}

          {showImage && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100}}>
              <Image alt='' width='400' height="400" src={image} />
              <Button onClick={anotherPrompt} className='hover' appearance="primary" color="yellow" style={{fontSize: 20, marginTop: 10, fontWeight: 600,  width: '100%', background: '#0353E9'}}>Another Prompt</Button>
            </div>
          }
      </main>
    </div>
  )
}
