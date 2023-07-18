"use client";

import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";
import "../../flow/config";
import Image from 'next/image';


export default function Recent() {

  const [user, setUser] = useState({loggedIn: null, addr: null})
  // const [images, setImages] = useState([{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'}]);  
  const [images, setImages] = useState([] as any);  

  useEffect(() => {fcl.currentUser.subscribe(setUser)}, []);
  //useeffect to fetch images from server
  useEffect(() => {
    //fetch images here and set to setImages
    fetchImages();
  }, []);

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

  const gallery = images.map((image: any, i: any) => {
    return (
      <div key={i} className="responsive">
        <div className="gallery">
          <a target="_blank" href="img_5terre.jpg">
            <Image src={image.link} alt="Cinque Terre" width={600} height={400} />
          </a>
          {/* <div className="desc">{image.description}</div> */}
        </div>
      </div>
    )});
  
  return (
    <div style={{padding: 24}}>
      {gallery}      
    </div>
  )
}
