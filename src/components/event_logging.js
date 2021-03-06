import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import EventTemplateList from './event_template_list';
import EventHistory from './event_history_ex_edu';
import EventInput from './event_input';
import EventCommentModal from './event_comment_modal';
import { Container, Row, Col } from 'react-bootstrap';
import EventShowDetailsModal from './event_show_details_modal_ex_edu';

import * as actions from '../actions';

class EventLogging extends Component {

  constructor (props) {
    super(props);

  }

  render() {

    if(this.props.roles && this.props.roles.includes("event_logger") && this.props.roles.includes("event_watcher")) {
      return (
        <div>
          <EventShowDetailsModal />
          <EventCommentModal/>
          <Container>
            <Row>
              <Col>
                <EventTemplateList style={{marginBottom: "8px"}} />
              </Col>
            </Row>
            <Row>
              <Col>
                <EventInput style={{marginBottom: "14px"}} />
              </Col>
            </Row>
            <Row>
              <Col>
                <EventHistory />
              </Col>
            </Row>
          </Container>
        </div>
      );
    }
    else if(this.props.roles && this.props.roles.includes("event_watcher")) {
      return (
        <div>
          <EventShowDetailsModal />
          <Container>
            <Row>
              <Col>
                <EventHistory />
              </Col>
            </Row>
          </Container>
        </div>
      );
    }
    return null
  }
}

function mapStateToProps(state) {

  return {
    roles: state.user.profile.roles
  }
}

export default connect(mapStateToProps, actions)(EventLogging);