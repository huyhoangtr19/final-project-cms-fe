// Function Name : Login Page
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import React from "react";
import { Container, Row, Col } from "reactstrap";

const Footer = () => {
  return (
    <React.Fragment>
      <footer
        onClick={(e) => window.open('https://actiwell.co/', '_blank')}
        className="footer"
        style={{ cursor: 'pointer' }}
      >
        <Container fluid={true}>
          <Row>
            <Col>
              <div className="d-none d-sm-block text-center">
                Copyright© {new Date().getFullYear()} Actiwell
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  );
};

export default Footer;
