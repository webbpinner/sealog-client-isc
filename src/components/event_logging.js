import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import EventTemplateList from './event_template_list';
import EventHistory from './event_history_ex_edu';
import EventInput from './event_input';
import EventCommentModal from './event_comment_modal';
import { Panel, Grid, Row, Col } from 'react-bootstrap';
import EventShowDetailsModal from './event_show_details_modal_ex_edu';

import * as actions from '../actions';

class EventLogging extends Component {

  constructor (props) {
    super(props);

  }

  render() {
    return (
      <div>
        {(this.props.roles && this.props.roles.includes("event_logger"))? <EventCommentModal/> : null }
        <EventShowDetailsModal />
        {
          (this.props.roles && this.props.roles.includes("event_logger"))?
            <Row>
              <Col>
                <EventTemplateList />
              </Col>
            </Row>
          : null
        }
        {(this.props.roles && this.props.roles.includes("event_logger"))? <br /> : null }
        {
          (this.props.roles && this.props.roles.includes("event_logger"))?
            <Row>
              <Col>
                <EventInput />
              </Col>
            </Row>
          : null
        }
        <br />
        <Row>
          <Col>
            <EventHistory />
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {

  return {
    roles: state.user.profile.roles
  }
}

export default connect(mapStateToProps, actions)(EventLogging);