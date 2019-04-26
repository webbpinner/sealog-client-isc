import React, { Component } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Checkbox, Row, Col, Thumbnail, ControlLabel, ListGroup, ListGroupItem, FormGroup, FormControl, FormGroupItem, Modal, Well } from 'react-bootstrap';
import { connectModal } from 'redux-modal';
import { LinkContainer } from 'react-router-bootstrap';
import Datetime from 'react-datetime';
import moment from 'moment';
// import ImagePreviewModal from './image_preview_modal';

import * as actions from '../actions';

import { API_ROOT_URL, IMAGE_PATH, ROOT_PATH  } from '../client_config';

const cookies = new Cookies();

class EventShowDetailsModal extends Component {

  constructor (props) {
    super(props);

    this.state = { event: {} }

    this.initEvent = this.initEvent.bind(this);
    this.handleEventUpdate = this.handleEventUpdate.bind(this);
    // this.handleImagePreviewModal = this.handleImagePreviewModal.bind(this);

  }

  static propTypes = {
    event: PropTypes.object.isRequired,
    handleHide: PropTypes.func.isRequired,
    handleUpdateEvent: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.initEvent()
  }

  componentWillUnmount() {
  }

  async initEvent() {
    try {
      const result = await axios.get(`${API_ROOT_URL}/api/v1/event_exports/${this.props.event.id}`,
        {
          headers: {
          authorization: cookies.get('token')
          }
        }      
      )

      this.setState({event: result.data})
    }
    catch (error) {
      console.log(error);
    }
  }

  handleMissingImage(ev) {
    ev.target.src = `${ROOT_PATH}images/noimage.jpeg`
  }

  // handleImagePreviewModal(source, filepath) {
  //   this.props.showModal('imagePreview', { name: source, filepath: filepath })
  // }

  renderImage(source, filepath) {
    return (
      <Thumbnail onError={this.handleMissingImage} src={filepath} onClick={ () => this.handleImagePreviewModal(source, filepath)}>
        <div>{`${source}`}</div>
      </Thumbnail>
    )
  }

  handleEventPermalinkModal() {
    this.props.showModal('eventPermalink', { event: this.state.event, handleUpdateEvent: this.handleEventUpdate });
  }

  async handleEventUpdate(event_id, event_value, event_free_text, event_options, event_ts) {
    this.props.handleUpdateEvent(event_id, event_value, event_free_text, event_options, event_ts)
    try {
      await this.initEvent()
    }
    catch(error) {
      console.log(error);
    }
  }

  renderImagerPanel() {
    if(this.props.event && this.state.event.aux_data) { 
      let frameGrabberData = this.state.event.aux_data.filter(aux_data => aux_data.data_source == 'framegrabber')
      let tmpData = []

      if(frameGrabberData.length > 0) {
        for (let i = 0; i < frameGrabberData[0].data_array.length; i+=2) {
    
          tmpData.push({source: frameGrabberData[0].data_array[i].data_value, filepath: API_ROOT_URL + IMAGE_PATH + '/' + frameGrabberData[0].data_array[i+1].data_value.split('/').pop()} )
        }

        return (
          <Row>
            {
              tmpData.map((image) => {
                return (
                  <Col key={image.source} xs={12} sm={6} md={3} lg={3}>
                    {this.renderImage(image.source, image.filepath)}
                  </Col>
                )
              })
            }
          </Row>
        )
      }
    }
  }

  renderAuxDataPanel() {

    let return_aux_data = []
    if(this.props.event && this.state.event.aux_data) {
      return this.state.event.aux_data.map((aux_data, index) => {
        let return_data = aux_data.data_array.map((data, index) => {
          return (<span key={`${aux_data.data_source}_data_point_${index}`}><label>{data.data_name}:</label><span> {data.data_value} {data.data_uom}</span><br/></span>)
        })
        return (
          <Col key={`${aux_data.data_source}`} xs={12} md={6}>
              <label>{aux_data.data_source}:</label>
              <ListGroup>
                <ListGroupItem>{return_data}</ListGroupItem>
              </ListGroup>
          </Col>
        )
      })
    }  

    return null
  }

  render() {
    const { show, handleHide } = this.props

    if(this.state.event.event_options) {

      let event_comment = null;
      let event_seatube_permalink = false;
      let eventOptions = this.state.event.event_options.map((option, index) => {
        if (option.event_option_name === 'event_comment') {
          event_comment = <Row><Col xs={12}><ListGroup><ListGroupItem>Comment: {option.event_option_value}</ListGroupItem></ListGroup></Col></Row>
        } else if (this.state.event.event_value === "EDU" && option.event_option_name === 'seatube_permalink') {
          event_seatube_permalink = true
          if(this.props.roles.includes("admin") || this.props.roles.includes("event_manager") || this.props.roles.includes("event_loggerr")) {
            return ( option.event_option_value !== '')? (<span key={`option_${index}`}>{option.event_option_name}: <a target="_blank" href={this.state.event.event_options[index].event_option_value}>{this.state.event.event_options[index].event_option_value}</a> (<span className="text-primary" onClick={() => this.handleEventPermalinkModal()}>Edit</span>)<br/></span>): (<span key={`option_${index}`}>{option.event_option_name}: (<span className="text-primary" onClick={() => this.handleEventPermalinkModal()}>Add</span>)<br/></span>)
          }
          else {
            return ( option.event_option_value !== '')? (<span key={`option_${index}`}>{option.event_option_name}: <a target="_blank" href={this.state.event.event_options[index].event_option_value}>{this.state.event.event_options[index].event_option_value}</a><br/></span>): (<span key={`option_${index}`}>{option.event_option_name}:<br/></span>) 
          }
        } else {
          return (<span key={`option_${index}`}>{option.event_option_name}: {option.event_option_value}<br/></span>)
        }
      })

      if(this.state.event.event_value === "EDU" && !event_seatube_permalink) {
        if(this.props.roles.includes("admin") || this.props.roles.includes("event_manager") || this.props.roles.includes("event_loggerr")) {
          eventOptions.push(<span key={`option_${eventOptions.length}`}>seatube_permalink: (<span className="text-primary" onClick={() => this.handleEventPermalinkModal()}>Add</span>)<br/></span>)
        }
        else {
          eventOptions.push(<span key={`option_${eventOptions.length}`}>seatube_permalink:<br/></span>) 
        }
      }

      return (
        <Modal bsSize="large" show={show} onHide={handleHide}>
            <Modal.Header closeButton>
              <Modal.Title>Event Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                {this.renderImagerPanel()}
              </Row>
              <Row>
                <Col xs={12} sm={6} md={4}>
                  <ListGroup>
                    <ListGroupItem>Date: {`${this.state.event.ts}`}<br/>Author: {`${this.state.event.event_author}`}<br/>Value: {`${this.state.event.event_value}`}<br/>{`Text: ${this.state.event.event_free_text}`}</ListGroupItem>
                  </ListGroup>
                </Col>
                <Col xs={12} sm={6} md={8}>
                  { (eventOptions.length > 0)?
                  <ListGroup>
                    <ListGroupItem>{eventOptions}</ListGroupItem>
                  </ListGroup>
                  : null }
                </Col>
              </Row>
              {event_comment}
              <Row>
                {this.renderAuxDataPanel()}
              </Row>
            </Modal.Body>
        </Modal>
      );
    } else {
      return (
        <Modal bsSize="large" show={show} onHide={handleHide}>
          <Modal.Header closeButton>
            <Modal.Title>Event Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Loading...
          </Modal.Body>
        </Modal>
      );
    }
  }
}

function mapStateToProps(state) {

  return {
    roles: state.user.profile.roles,
  }

}

EventShowDetailsModal = connect(
  mapStateToProps, actions
)(EventShowDetailsModal)

export default connectModal({ name: 'eventShowDetails', destroyOnHide: true })(EventShowDetailsModal)
