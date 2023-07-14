"use client";

import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";
import "../../flow/config";
import Image from 'next/image';


export default function Recent() {

  const [user, setUser] = useState({loggedIn: null, addr: null})
  const [images, setImages] = useState([{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'},{link:'https://dummyimage.com/250/ffffff/000000', description:'some description'}]);  

  useEffect(() => {fcl.currentUser.subscribe(setUser)}, []);
  //useeffect to fetch images from server
  useEffect(() => {
    //fetch images here and set to setImages
  }, []);

  const gallery = images.map((image, i) => {
    return (
      <div key={i} className="responsive">
        <div className="gallery">
          <a target="_blank" href="img_5terre.jpg">
            <Image src={image.link} alt="Cinque Terre" width={600} height={400} />
          </a>
          <div className="desc">{image.description}</div>
        </div>
      </div>
    )});
  
  return (
    <div style={{padding: 24}}>
      {gallery}      
    </div>
  )
}
