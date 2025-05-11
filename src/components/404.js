import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Player } from '@lottiefiles/react-lottie-player';
import animationdata from "../img/Animation - 1746953494264.json"
import { useNavigate } from 'react-router-dom';
/**
 *
 *
 * @return {*} 
 */
const NotFoundPage = () => {
  const navigate=useNavigate();
  return (
    <div style={{  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <section>
        <div className="container-fluid">
          <div className="row row-cols-1 justify-content-center py-5">
            <div className="col-xxl-7 mb-4">
              <div className="lc-block">
                <Player
                  src={animationdata}
                  className="mx-auto"
                  background="transparent"
                  speed="1"
                  loop
                  autoplay
                />
              </div>
            </div>
            <div className="col text-center">
              <div className="lc-block mb-4">
                <p className="rfs-11" style={{ color: 'white' }}>
                  The page you are looking for was moved, removed or might never existed.
                </p>
              </div>
              <div className="lc-block">
                <a className="btn btn-lg " style={{backgroundColor:'#ffff00',color:'black'}}  role="button" onClick={()=>navigate(-1)}>
                  Navigate Back
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;
