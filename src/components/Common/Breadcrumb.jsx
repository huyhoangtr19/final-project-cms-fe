// Function Name : Breadcrumb
// Created date :  20/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Row, Col, BreadcrumbItem } from "reactstrap";

const Breadcrumb = (props) => {
  return (<></>);
  //   <Row className="bg-white align-items-center ">
  //     <Col xs="12">
  //       <div className="d-sm-flex align-items-center justify-content-between">
  //         <ol className="breadcrumb p-2 m-0">
  //           <BreadcrumbItem style={{ fontSize: 18 }}>
  //             <Link to="#">{props.title}</Link>
  //           </BreadcrumbItem>
  //           {props.breadcrumbItem?.length ? (
  //             <BreadcrumbItem style={{ fontSize: 18 }} active>
  //               {props.breadcrumbItem}
  //             </BreadcrumbItem>
  //           ) : null}
  //         </ol>
  //       </div>
  //     </Col>
  //   </Row>
  // );
};

Breadcrumb.propTypes = {
  breadcrumbItem: PropTypes?.string,
  title: PropTypes.string,
};

export default Breadcrumb;
