import React from "react";
import Footer from "./Footer";

function About() {
  return (
    <>
      {/* SECTION 1 */}
      <section className="wrapper bg-soft-primary">
        <div className="container pt-10 pb-20 pt-md-14 pb-md-23 text-center">
          <div className="row">
            <div className="col-xl-5 mx-auto mb-6">
              <h1 className="display-1 mb-3">About Us</h1>
              <p className="lead mb-0">
                A company turning ideas into new things.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 */}
      <section className="wrapper bg-light">
        <div className="container pb-14 pb-md-16">
          <div className="row text-center mb-12 mb-md-15">
            <div className="col-md-10 offset-md-1 col-lg-8 offset-lg-2 mt-n18 mt-md-n22">
              <figure>
                <img
                  className="w-auto"
                  src="./assets/img/illustrations/i8.png"
                  srcSet="./assets/img/illustrations/i8@2x.png 2x"
                  alt=""
                />
              </figure>
            </div>
          </div>

          <div className="row gx-lg-8 gx-xl-12 gy-6 mb-10 align-items-center">
            <div className="col-lg-6 order-lg-2">
              <ul className="progress-list">
                <li>
                  <p>Marketing</p>
                  <div className="progressbar line blue" data-value="100"></div>
                </li>
                <li>
                  <p>Strategy</p>
                  <div className="progressbar line green" data-value="80"></div>
                </li>
                <li>
                  <p>Development</p>
                  <div className="progressbar line yellow" data-value="85"></div>
                </li>
                <li>
                  <p>Data Analysis</p>
                  <div className="progressbar line orange" data-value="90"></div>
                </li>
              </ul>
            </div>

            <div className="col-lg-6">
              <h3 className="display-5 mb-5">
                The full service we are offering is specifically designed to
                meet your business needs and projects.
              </h3>
              <p>
                Integer posuere erat a ante venenatis dapibus posuere velit
                aliquet. Morbi leo risus, porta ac consectetur ac, vestibulum at
                eros. Praesent commodo cursus magna, vel scelerisque nisl
                consectetur duis mollis commodo.
              </p>
            </div>
          </div>

          {/* SERVICES CARDS */}
          <div className="row gx-lg-8 gx-xl-12 gy-6 gy-md-0 text-center">
            <div className="col-md-6 col-lg-3">
              <img
                src="./assets/img/icons/lineal/megaphone.svg"
                className="svg-inject icon-svg icon-svg-md text-blue mb-3"
                alt=""
              />
              <h4>Marketing</h4>
              <p className="mb-2">
                Nulla vitae elit libero, a pharetra augue. Donec id elit non mi
                porta gravida at eget metus.
              </p>
            </div>

            <div className="col-md-6 col-lg-3">
              <img
                src="./assets/img/icons/lineal/target.svg"
                className="svg-inject icon-svg icon-svg-md text-green mb-3"
                alt=""
              />
              <h4>Strategy</h4>
              <p className="mb-2">
                Nulla vitae elit libero, a pharetra augue. Donec id elit non mi
                porta gravida at eget metus.
              </p>
            </div>

            <div className="col-md-6 col-lg-3">
              <img
                src="./assets/img/icons/lineal/settings-3.svg"
                className="svg-inject icon-svg icon-svg-md text-yellow mb-3"
                alt=""
              />
              <h4>Development</h4>
              <p className="mb-2">
                Nulla vitae elit libero, a pharetra augue. Donec id elit non mi
                porta gravida at eget metus.
              </p>
            </div>

            <div className="col-md-6 col-lg-3">
              <img
                src="./assets/img/icons/lineal/bar-chart.svg"
                className="svg-inject icon-svg icon-svg-md text-orange mb-3"
                alt=""
              />
              <h4>Data Analysis</h4>
              <p className="mb-2">
                Nulla vitae elit libero, a pharetra augue. Donec id elit non mi
                porta gravida at eget metus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="wrapper bg-light">
        <div className="container py-14 py-md-16">
          <div className="row gx-lg-8 gx-xl-12 gy-10 align-items-center">
            
            {/* Team Text */}
            <div className="col-lg-4">
              <h2 className="fs-15 text-uppercase text-line text-primary text-center mb-3">
                Meet the Team
              </h2>
              <h3 className="display-5 mb-5">
                Save your time and money by choosing our professional team.
              </h3>
              <p>
                Donec id elit non mi porta gravida at eget metus. Morbi leo
                risus, porta ac consectetur ac, vestibulum at eros tempus
                porttitor.
              </p>
              <a href="#" className="btn btn-primary rounded-pill mt-3">
                See All Members
              </a>
            </div>

            {/* Single Team Member (map removed) */}
            <div className="col-lg-8">
              <div className="text-center p-4 border rounded shadow-sm">
                <img
                  className="rounded-circle w-20 mx-auto mb-4"
                  src="./assets/img/avatars/t1.jpg"
                  srcSet="./assets/img/avatars/t1@2x.jpg 2x"
                  alt="Cory Zamora"
                />
                <h4 className="mb-1">Harshit</h4>
                <div className="meta mb-2">FullStack Web Devloper</div>
                <p className="mb-2">A passionate specialist in full-stack web development and modern application architecture.</p>

                <nav className="nav social justify-content-center text-center mb-0">
                  <a href="#"><i className="uil uil-twitter"></i></a>
                  <a href="#"><i className="uil uil-slack"></i></a>
                  <a href="https://www.linkedin.com/in/harshitrajput20/"><i className="uil uil-linkedin"></i></a>
                </nav>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default About;
